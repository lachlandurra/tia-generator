#!/usr/bin/env python3
"""
Core generation logic for TIA reports with optimized performance.
Implements parallel processing, model selection, and progressive generation.
"""

import os
import json
import time
import asyncio
import logging
import hashlib
import traceback
from typing import Dict, Any, List, Tuple, Optional, Set

# Update imports
from openai import AsyncOpenAI
import openai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from dotenv import load_dotenv

from prompt_engineering import get_optimized_prompt, get_section_system_prompt
from model_selection import select_model_for_section
import metrics

# Initialize logging
logger = logging.getLogger("tia-generator")

# Load environment variables
load_dotenv()

# Configure OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Default model settings
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
DEFAULT_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
DEFAULT_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "1000"))  # Reduced per section
DEFAULT_MAX_RETRIES = int(os.getenv("OPENAI_MAX_RETRIES", "3"))
DEFAULT_CONCURRENCY_LIMIT = int(os.getenv("CONCURRENCY_LIMIT", "5"))

# Concurrency control
api_semaphore = asyncio.Semaphore(DEFAULT_CONCURRENCY_LIMIT)

def validate_input_data(data: Dict[str, Any]) -> List[str]:
    """
    Validate input data before processing.
    Returns a list of error messages, or an empty list if validation passes.
    """
    errors = []
    
    # Check required sections
    required_sections = [
        "project_details", "introduction", "existing_conditions", 
        "proposal", "parking_assessment", "parking_design", 
        "other_matters", "conclusion"
    ]
    
    for section in required_sections:
        if section not in data:
            errors.append(f"Missing required section: {section}")
    
    # Check required project details
    if "project_details" in data:
        required_fields = ["project_title", "site_address"]
        for field in required_fields:
            if field not in data["project_details"] or not data["project_details"][field]:
                errors.append(f"Missing required field: project_details.{field}")
    
    # Check required introduction fields
    if "introduction" in data:
        if "purpose" not in data["introduction"] or not data["introduction"]["purpose"]:
            errors.append("Missing required field: introduction.purpose")
    
    return errors

def extract_sections(data: Dict[str, Any]) -> Dict[str, str]:
    """
    Extract sections from the input data for parallel processing.
    Maps section names to their corresponding content.
    """
    sections = {
        "introduction_purpose": data.get("introduction", {}).get("purpose", ""),
        "existing_conditions_site_location": data.get("existing_conditions", {}).get("site_location_description", ""),
        "existing_conditions_land_use": data.get("existing_conditions", {}).get("existing_land_use_and_layout", ""),
        "existing_conditions_road_network": data.get("existing_conditions", {}).get("surrounding_road_network_details", ""),
        "existing_conditions_public_transport": data.get("existing_conditions", {}).get("public_transport_options", ""),
        "proposal_description": data.get("proposal", {}).get("description", ""),
        "proposal_facilities": data.get("proposal", {}).get("facilities_details", ""),
        "proposal_parking": data.get("proposal", {}).get("parking_arrangement", ""),
        "parking_existing_provision": data.get("parking_assessment", {}).get("existing_parking_provision", ""),
        "parking_proposed_provision": data.get("parking_assessment", {}).get("proposed_parking_provision", ""),
        "parking_rates_calculations": data.get("parking_assessment", {}).get("parking_rates_calculations", ""),
        "parking_expected_patrons": data.get("parking_assessment", {}).get("expected_patrons", ""),
        "parking_justification": data.get("parking_assessment", {}).get("justification", ""),
        "parking_design_dimensions": data.get("parking_design", {}).get("dimensions_layout", ""),
        "parking_design_compliance": data.get("parking_design", {}).get("compliance", ""),
        "other_bicycle_parking": data.get("other_matters", {}).get("bicycle_parking", ""),
        "other_loading_waste": data.get("other_matters", {}).get("loading_and_waste", ""),
        "other_traffic_generation": data.get("other_matters", {}).get("traffic_generation", ""),
        "conclusion_summary": data.get("conclusion", {}).get("summary", "")
    }
    
    # Add context-rich fields for better generation
    sections["_project_title"] = data.get("project_details", {}).get("project_title", "")
    sections["_site_address"] = data.get("project_details", {}).get("site_address", "")
    sections["_development_type"] = data.get("project_details", {}).get("development_type", "")
    sections["_zoning"] = data.get("project_details", {}).get("zoning", "")
    sections["_council"] = data.get("project_details", {}).get("council", "")
    
    return sections

def get_cache_key(section: str, content: str, project_context: Dict[str, str]) -> str:
    """
    Generate deterministic cache key based on input data
    """
    # Include project context in the key for better matching
    context_str = json.dumps({
        "section": section,
        "content": content,
        "project_title": project_context.get("_project_title", ""),
        "development_type": project_context.get("_development_type", ""),
        "council": project_context.get("_council", "")
    }, sort_keys=True)
    
    return hashlib.md5(context_str.encode()).hexdigest()

def prioritize_sections() -> Dict[str, int]:
    """
    Define section processing priority (lower = higher priority)
    This helps with perceived performance and logical dependencies
    """
    return {
        "introduction_purpose": 1,
        "existing_conditions_site_location": 2,
        "existing_conditions_land_use": 3,
        "existing_conditions_road_network": 4,
        "existing_conditions_public_transport": 5,
        "proposal_description": 2,
        "proposal_facilities": 6,
        "proposal_parking": 3,
        "parking_existing_provision": 7,
        "parking_proposed_provision": 4,
        "parking_rates_calculations": 8,
        "parking_expected_patrons": 9,
        "parking_justification": 5,
        "parking_design_dimensions": 10,
        "parking_design_compliance": 11,
        "other_bicycle_parking": 12,
        "other_loading_waste": 13,
        "other_traffic_generation": 6,
        "conclusion_summary": 14,
    }

@retry(
    stop=stop_after_attempt(DEFAULT_MAX_RETRIES),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((openai.RateLimitError, openai.APIConnectionError)),
    reraise=True
)
async def call_openai_api(model: str, messages: List[Dict[str, str]], max_tokens: int, temperature: float) -> str:
    """
    Call OpenAI API with retry logic, optimized for async operation
    """
    async with api_semaphore:  # Limit concurrent API calls
        start_time = time.time()
        try:
            # Fix: Use the correct async pattern for current OpenAI SDK
            # The client doesn't have an 'acreate' method, we need to use the async client
            client = openai.AsyncOpenAI(api_key=openai.api_key)
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            # Extract and return the response text
            result = response.choices[0].message.content.strip()
            
            # Record metrics
            duration = time.time() - start_time
            metrics.record_api_call(model, duration, max_tokens)
            
            return result
            
        except (openai.RateLimitError, openai.APIConnectionError) as e:
            # These errors are automatically retried
            logger.warning(f"OpenAI API error (will retry): {str(e)}")
            metrics.record_api_failure(model, str(e))
            raise
            
        except Exception as e:
            # Other errors are logged and re-raised
            logger.error(f"OpenAI API error: {str(e)}")
            metrics.record_api_failure(model, str(e))
            raise
async def generate_section(
    section: str, 
    content: str,
    project_context: Dict[str, str],
    redis_cache = None
) -> Tuple[str, str]:
    """
    Generate a single TIA section asynchronously
    """
    if not content or content.strip() == "":
        return section, ""
    
    # Check cache if available
    if redis_cache:
        cache_key = get_cache_key(section, content, project_context)
        cached_result = await redis_cache.get_section(section, cache_key)
        if cached_result:
            logger.info(f"Cache hit for section {section}")
            metrics.record_cache_hit(section)
            return section, cached_result
    
    # Select appropriate model based on section complexity
    content_length = len(content)
    model = select_model_for_section(section, content_length)
    
    # Get optimized prompt for this section
    system_prompt = get_section_system_prompt(section)
    user_prompt = get_optimized_prompt(
        section, 
        content, 
        project_title=project_context.get("_project_title", ""),
        site_address=project_context.get("_site_address", ""),
        development_type=project_context.get("_development_type", ""),
        council=project_context.get("_council", "")
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    # Set appropriate token limit based on section
    token_limit = DEFAULT_MAX_TOKENS
    if section in ["introduction_purpose", "conclusion_summary"]:
        token_limit = 600  # Shorter sections
    elif section in ["existing_conditions_road_network", "proposal_description"]:
        token_limit = 1200  # Potentially longer sections
    
    start_time = time.time()
    try:
        # Call OpenAI API
        result = await call_openai_api(
            model=model,
            messages=messages,
            max_tokens=token_limit,
            temperature=DEFAULT_TEMPERATURE
        )
        
        # Cache the result if cache is available
        if redis_cache:
            cache_key = get_cache_key(section, content, project_context)
            await redis_cache.set_section(section, cache_key, result)
        
        metrics.record_section_generation(section, time.time() - start_time)
        return section, result
        
    except Exception as e:
        logger.error(f"Error generating section {section}: {str(e)}")
        metrics.record_section_failure(section, str(e))
        return section, f"Error generating content: {str(e)}"

async def generate_tia_report(job_id: str, data: Dict[str, Any], redis_cache = None) -> Dict[str, str]:
    """
    Generate a complete TIA report using parallel processing
    """
    start_time = time.time()
    
    try:
        logger.info(f"Starting TIA generation for job {job_id}")
        
        # Update job status
        if redis_cache:
            await redis_cache.set_job_status(job_id, "processing")
            await redis_cache.set_job_input(job_id, data)
        
        # Extract sections from input data
        sections = extract_sections(data)
        priorities = prioritize_sections()
        
        # Create tasks for all sections, sorted by priority
        tasks = []
        section_keys = sorted(
            [s for s in sections.keys() if not s.startswith("_")],
            key=lambda s: priorities.get(s, 999)
        )
        
        for section in section_keys:
            tasks.append(
                generate_section(
                    section=section,
                    content=sections[section],
                    project_context={k: v for k, v in sections.items() if k.startswith("_")},
                    redis_cache=redis_cache
                )
            )
        
        # Run all tasks concurrently with bounded concurrency
        results = await asyncio.gather(*tasks)
        
        # Combine results
        final_report = {section: content for section, content in results if section and content}
        
        total_time = time.time() - start_time
        logger.info(f"TIA generation completed in {total_time:.2f}s for job {job_id}")
        metrics.record_full_report_generation(total_time, len(final_report))
        
        # Update job status and store result
        if redis_cache:
            await redis_cache.set_job_result(job_id, final_report)
            await redis_cache.set_job_status(job_id, "finished")
            
            # Generate cache key for the full report for future similar requests
            report_hash = hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()
            await redis_cache.set_report_hash(report_hash, final_report)
        
        return final_report
        
    except Exception as e:
        error_msg = f"Error generating TIA report: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        
        # Update job status
        if redis_cache:
            await redis_cache.set_job_error(job_id, error_msg)
            await redis_cache.set_job_status(job_id, "failed")
        
        return {"error": str(e), "traceback": traceback.format_exc()}

async def generate_tia_report_progressive(job_id: str, data: Dict[str, Any], redis_cache = None) -> None:
    """
    Generate a TIA report with progressive updates sent via Redis pubsub
    """
    start_time = time.time()
    completed_sections: Set[str] = set()
    
    try:
        logger.info(f"Starting progressive TIA generation for job {job_id}")
        
        # Update job status
        if redis_cache:
            await redis_cache.set_job_status(job_id, "processing")
            await redis_cache.set_job_input(job_id, data)
        
        # Extract sections from input data
        sections = extract_sections(data)
        priorities = prioritize_sections()
        
        # Sort sections by priority
        section_keys = sorted(
            [s for s in sections.keys() if not s.startswith("_")],
            key=lambda s: priorities.get(s, 999)
        )
        
        # Process in batches based on priority tiers
        priority_tiers = {}
        for section in section_keys:
            priority = priorities.get(section, 999)
            if priority not in priority_tiers:
                priority_tiers[priority] = []
            priority_tiers[priority].append(section)
        
        # Get context that will be shared across all sections
        project_context = {k: v for k, v in sections.items() if k.startswith("_")}
        
        # Process each priority tier
        final_report = {}
        for priority in sorted(priority_tiers.keys()):
            tier_sections = priority_tiers[priority]
            
            # Create tasks for this tier
            tasks = []
            for section in tier_sections:
                if sections[section]:  # Only process non-empty sections
                    tasks.append(
                        generate_section(
                            section=section,
                            content=sections[section],
                            project_context=project_context,
                            redis_cache=redis_cache
                        )
                    )
            
            # Skip if no tasks in this tier
            if not tasks:
                continue
                
            # Process this tier
            tier_results = await asyncio.gather(*tasks)
            
            # Publish each completed section
            for section, content in tier_results:
                if section and content:
                    final_report[section] = content
                    completed_sections.add(section)
                    
                    # Publish section update
                    if redis_cache:
                        section_data = json.dumps({section: content})
                        await redis_cache.publish(f"tia_updates:{job_id}", section_data)
                        
                        # Update metrics
                        metrics.record_progressive_update(section)
            
            # Brief pause between tiers to allow frontend to process
            await asyncio.sleep(0.1)
        
        # Publish completion message
        if redis_cache:
            await redis_cache.publish(
                f"tia_updates:{job_id}", 
                json.dumps({"status": "complete"})
            )
            
            # Store final result
            await redis_cache.set_job_result(job_id, final_report)
            await redis_cache.set_job_status(job_id, "finished")
            
            # Generate cache key for the full report
            report_hash = hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()
            await redis_cache.set_report_hash(report_hash, final_report)
        
        total_time = time.time() - start_time
        logger.info(f"Progressive TIA generation completed in {total_time:.2f}s for job {job_id}")
        metrics.record_full_report_generation(total_time, len(final_report))
        
    except Exception as e:
        error_msg = f"Error in progressive TIA generation: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        
        # Update job status and publish error
        if redis_cache:
            await redis_cache.set_job_error(job_id, error_msg)
            await redis_cache.set_job_status(job_id, "failed")
            await redis_cache.publish(
                f"tia_updates:{job_id}", 
                json.dumps({"status": "failed", "error": str(e)})
            )