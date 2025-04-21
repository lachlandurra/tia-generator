#!/usr/bin/env python3
"""
FastAPI application for TIA Generator with optimized performance.
This replaces the Flask app with an async-focused FastAPI implementation.
"""

import os
import time
import uuid
import logging
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Import optimized modules
from tia_generator import (
    generate_tia_report, 
    generate_tia_report_progressive,
    validate_input_data
)
from caching import RedisCache
from document_generator import generate_docx
from models import TIARequest, TIAResponse, ErrorResponse, JobStatus
import metrics

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("tia-generator")

# Initialize Redis cache
redis_cache = RedisCache()

# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize cache and metrics
    await redis_cache.initialize()
    metrics.init_metrics()
    logger.info("TIA Generator backend initialized")
    
    yield
    
    # Shutdown: close connections
    await redis_cache.close()
    logger.info("TIA Generator backend shutdown complete")

# Initialize FastAPI application
app = FastAPI(
    title="TIA Generator API",
    description="Optimized Traffic Impact Assessment Generator API",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for request timing
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}"
    metrics.record_request_time(request.url.path, process_time)
    logger.info(f"Request to {request.url.path} processed in {process_time:.4f}s")
    return response

# Routes
@app.get("/")
async def health_check():
    """API health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/generate-tia", response_model=Dict[str, str])
async def create_tia_job(request: TIARequest, background_tasks: BackgroundTasks):
    """
    Enqueue a TIA generation job (standard method)
    """
    # Validate input data
    validation_errors = validate_input_data(request.dict())
    if validation_errors:
        logger.warning(f"Input validation errors: {validation_errors}")
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid input data", "details": validation_errors}
        )
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Check cache for similar request
    cache_hit = await redis_cache.get_similar_report(request.dict())
    if cache_hit:
        logger.info(f"Cache hit for similar report, using cached result with job_id: {job_id}")
        await redis_cache.set_job_result(job_id, cache_hit, time_to_live=3600*24*7)
        await redis_cache.set_job_status(job_id, "finished")
        return {"job_id": job_id, "status": "cached"}
    
    # If no cache hit, queue the job for processing
    background_tasks.add_task(
        generate_tia_report,
        job_id=job_id,
        data=request.dict(),
        redis_cache=redis_cache
    )
    
    return {"job_id": job_id}

@app.post("/generate-tia-streaming", response_model=Dict[str, str])
async def create_tia_streaming_job(request: TIARequest, background_tasks: BackgroundTasks):
    """
    Enqueue a TIA generation job with progressive streaming results
    """
    # Validate input data
    validation_errors = validate_input_data(request.dict())
    if validation_errors:
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid input data", "details": validation_errors}
        )
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Initialize job status
    await redis_cache.set_job_status(job_id, "queued")
    
    # Queue the job for progressive processing
    background_tasks.add_task(
        generate_tia_report_progressive,
        job_id=job_id,
        data=request.dict(),
        redis_cache=redis_cache
    )
    
    return {"job_id": job_id}

@app.get("/job-status/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """
    Get the status of a TIA generation job
    """
    # Check if job exists
    status = await redis_cache.get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # If job is finished, return the result
    if status == "finished":
        result = await redis_cache.get_job_result(job_id)
        if not result:
            return {"status": "missing", "error": "Result not found"}
        return {"status": "finished", "result": result}
    
    # If job failed, return the error
    if status == "failed":
        error = await redis_cache.get_job_error(job_id)
        return {"status": "failed", "error": error or "Unknown error"}
    
    # Otherwise return the current status
    return {"status": status}

@app.get("/stream-sections/{job_id}")
async def stream_job_sections(job_id: str):
    """
    Stream TIA sections as they are generated
    """
    async def event_generator():
        pubsub = redis_cache.pubsub
        await pubsub.subscribe(f"tia_updates:{job_id}")
        
        try:
            # First check if job is already complete
            status = await redis_cache.get_job_status(job_id)
            if status == "finished":
                result = await redis_cache.get_job_result(job_id)
                if result:
                    for key, value in result.items():
                        yield f"data: {{\"{key}\": {json.dumps(value)}}}\n\n"
                    yield f"data: {{\"status\": \"complete\"}}\n\n"
                    return
            
            # Otherwise stream updates as they arrive
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message is not None:
                    data = message["data"]
                    if isinstance(data, bytes):
                        data = data.decode("utf-8")
                    yield f"data: {data}\n\n"
                    
                    # Check if this was the completion message
                    if '"status": "complete"' in data:
                        break
                
                # Check if job failed or completed while we were waiting
                status = await redis_cache.get_job_status(job_id)
                if status == "failed":
                    error = await redis_cache.get_job_error(job_id)
                    yield f"data: {{\"status\": \"failed\", \"error\": {json.dumps(error or 'Unknown error')}}}\n\n"
                    break
                
                # Add heartbeat to keep connection alive
                yield f"data: {{\"heartbeat\": {time.time()}}}\n\n"
                
                # Sleep briefly to prevent tight loop
                await asyncio.sleep(0.1)
        finally:
            await pubsub.unsubscribe(f"tia_updates:{job_id}")
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/download-docx/{job_id}")
async def download_docx_report(job_id: str, project_data: Optional[Dict[str, Any]] = None):
    """
    Generate and download a Word document from the TIA report
    """
    # Get the TIA result
    result = await redis_cache.get_job_result(job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Job result not found")
    
    # Merge project data if provided, otherwise try to get it from cache
    if not project_data:
        project_data = await redis_cache.get_job_input(job_id)
        if not project_data:
            project_data = {}
    
    # Generate the DOCX file
    try:
        docx_bytes, filename = await generate_docx(result, project_data)
        
        # Return the file
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
        return Response(
            content=docx_bytes.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers=headers
        )
    except Exception as e:
        logger.exception("Error generating DOCX file")
        raise HTTPException(status_code=500, detail=f"Error generating DOCX: {str(e)}")

@app.post("/download-docx")
async def download_docx_direct(data: Dict[str, Any]):
    """
    Generate and download a Word document directly from provided data
    """
    try:
        docx_bytes, filename = await generate_docx(data, data.get("project_details", {}))
        
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
        return Response(
            content=docx_bytes.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
            headers=headers
        )
    except Exception as e:
        logger.exception("Error generating DOCX file")
        raise HTTPException(status_code=500, detail=f"Error generating DOCX: {str(e)}")

@app.get("/metrics")
async def get_metrics():
    """Get performance metrics"""
    return metrics.get_all_metrics()

# Run the application
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True, workers=4)