#!/usr/bin/env python3
"""
Redis caching layer for TIA Generator
Provides efficient caching of generated sections and reports
"""

import os
import json
import asyncio
import logging
import hashlib
from typing import Dict, Any, Optional, List, Set

import redis.asyncio as redis
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger("tia-generator.cache")

class RedisCache:
    """Redis caching implementation with async support"""
    
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis = None
        self.pubsub = None
        self.default_ttl = 60 * 60 * 24 * 7  # 7 days default TTL
        self.section_ttl = 60 * 60 * 24 * 30  # 30 days for sections
        self.initialized = False
    
    async def initialize(self):
        """Initialize Redis connection"""
        url = os.getenv("REDIS_URL")
        print(f"DEBUG: RAW REDIS_URL = {url!r}")
        logger.info(f"🔍 REDIS_URL = {url!r}")

        # optional fallback if someone forgot the scheme
        if url and not url.startswith(("redis://","rediss://","unix://")):
            url = "redis://" + url
            print(f"DEBUG: Prefixed REDIS_URL = {url!r}")

        # now make the real connection
        self._conn = redis.Redis.from_url(url, decode_responses=True)
        await self._conn.ping()
        print("DEBUG: Redis ping OK")

        if self.initialized:
            return
            
        try:
            logger.info(f"Connecting to Redis at {self.redis_url}")
            self.redis = redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            self.pubsub = self.redis.pubsub()
            
            # Test connection
            await self.redis.ping()
            logger.info("Redis connection established")
            self.initialized = True
        except Exception as e:
            logger.error(f"Redis connection failed: {str(e)}")
            # Fallback to in-memory cache if Redis is unavailable
            self._setup_memory_fallback()
    
    def _setup_memory_fallback(self):
        """Set up in-memory cache fallback if Redis is unavailable"""
        logger.warning("Using in-memory cache fallback (data will not persist)")
        self.memory_cache = {
            "sections": {},  # Cache for individual sections
            "reports": {},   # Cache for complete reports
            "jobs": {},      # Cache for job status and results
            "hashes": {},    # Mapping of report hashes to results
        }
        self.initialized = True
    
    async def close(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()
            logger.info("Redis connection closed")
    
    async def _ensure_initialized(self):
        """Ensure Redis is initialized before use"""
        if not self.initialized:
            await self.initialize()
    
    # Section caching
    
    async def get_section(self, section: str, cache_key: str) -> Optional[str]:
        """Get a cached section if available"""
        await self._ensure_initialized()
        
        try:
            if self.redis:
                section_key = f"tia:section:{section}:{cache_key}"
                return await self.redis.get(section_key)
            else:
                # Memory fallback
                return self.memory_cache["sections"].get(f"{section}:{cache_key}")
        except Exception as e:
            logger.error(f"Error retrieving cached section: {str(e)}")
            return None
    
    async def set_section(self, section: str, cache_key: str, content: str, time_to_live: int = None) -> bool:
        """Cache a generated section"""
        await self._ensure_initialized()
        
        if not time_to_live:
            time_to_live = self.section_ttl
            
        try:
            if self.redis:
                section_key = f"tia:section:{section}:{cache_key}"
                return await self.redis.setex(section_key, time_to_live, content)
            else:
                # Memory fallback
                self.memory_cache["sections"][f"{section}:{cache_key}"] = content
                return True
        except Exception as e:
            logger.error(f"Error caching section: {str(e)}")
            return False
    
    # Job status and results
    
    async def set_job_status(self, job_id: str, status: str) -> bool:
        """Set job status"""
        await self._ensure_initialized()
        
        try:
            if self.redis:
                return await self.redis.setex(f"tia:job:{job_id}:status", self.default_ttl, status)
            else:
                # Memory fallback
                if job_id not in self.memory_cache["jobs"]:
                    self.memory_cache["jobs"][job_id] = {}
                self.memory_cache["jobs"][job_id]["status"] = status
                return True
        except Exception as e:
            logger.error(f"Error setting job status: {str(e)}")
            return False
    
    async def get_job_status(self, job_id: str) -> Optional[str]:
        """Get job status"""
        await self._ensure_initialized()
        
        try:
            if self.redis:
                return await self.redis.get(f"tia:job:{job_id}:status")
            else:
                # Memory fallback
                return self.memory_cache["jobs"].get(job_id, {}).get("status")
        except Exception as e:
            logger.error(f"Error getting job status: {str(e)}")
            return None
    
    async def set_job_result(self, job_id: str, result: Dict[str, Any], time_to_live: int = None) -> bool:
        """Cache job result"""
        await self._ensure_initialized()
        
        if not time_to_live:
            time_to_live = self.default_ttl
            
        try:
            result_json = json.dumps(result)
            if self.redis:
                return await self.redis.setex(f"tia:job:{job_id}:result", time_to_live, result_json)
            else:
                # Memory fallback
                if job_id not in self.memory_cache["jobs"]:
                    self.memory_cache["jobs"][job_id] = {}
                self.memory_cache["jobs"][job_id]["result"] = result
                return True
        except Exception as e:
            logger.error(f"Error caching job result: {str(e)}")
            return False
    
    async def get_job_result(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get cached job result"""
        await self._ensure_initialized()
        
        try:
            if self.redis:
                result_json = await self.redis.get(f"tia:job:{job_id}:result")
                if result_json:
                    return json.loads(result_json)
                return None
            else:
                # Memory fallback
                return self.memory_cache["jobs"].get(job_id, {}).get("result")
        except Exception as e:
            logger.error(f"Error retrieving job result: {str(e)}")
            return None
    
    async def set_job_error(self, job_id: str, error: str) -> bool:
        """Cache job error"""
        await self._ensure_initialized()
        
        try:
            if self.redis:
                return await self.redis.setex(f"tia:job:{job_id}:error", self.default_ttl, error)
            else:
                # Memory fallback
                if job_id not in self.memory_cache["jobs"]:
                    self.memory_cache["jobs"][job_id] = {}
                self.memory_cache["jobs"][job_id]["error"] = error
                return True
        except Exception as e:
            logger.error(f"Error caching job error: {str(e)}")
            return False
    
    async def get_job_error(self, job_id: str) -> Optional[str]:
        """Get cached job error"""
        await self._ensure_initialized()
        
        try:
            if self.redis:
                return await self.redis.get(f"tia:job:{job_id}:error")
            else:
                # Memory fallback
                return self.memory_cache["jobs"].get(job_id, {}).get("error")
        except Exception as e:
            logger.error(f"Error retrieving job error: {str(e)}")
            return None
    
    async def set_job_input(self, job_id: str, input_data: Dict[str, Any]) -> bool:
        """Cache job input data"""
        await self._ensure_initialized()
        
        try:
            input_json = json.dumps(input_data)
            if self.redis:
                return await self.redis.setex(f"tia:job:{job_id}:input", self.default_ttl, input_json)
            else:
                # Memory fallback
                if job_id not in self.memory_cache["jobs"]:
                    self.memory_cache["jobs"][job_id] = {}
                self.memory_cache["jobs"][job_id]["input"] = input_data
                return True
        except Exception as e:
            logger.error(f"Error caching job input: {str(e)}")
            return False
    
    async def get_job_input(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get cached job input data"""
        await self._ensure_initialized()
        
        try:
            if self.redis:
                input_json = await self.redis.get(f"tia:job:{job_id}:input")
                if input_json:
                    return json.loads(input_json)
                return None
            else:
                # Memory fallback
                return self.memory_cache["jobs"].get(job_id, {}).get("input")
        except Exception as e:
            logger.error(f"Error retrieving job input: {str(e)}")
            return None
    
    # Report hashing for similar report detection
    
    async def set_report_hash(self, report_hash: str, result: Dict[str, Any]) -> bool:
        """Cache report result by hash for similar report detection"""
        await self._ensure_initialized()
        
        try:
            result_json = json.dumps(result)
            if self.redis:
                return await self.redis.setex(f"tia:report:{report_hash}", self.default_ttl, result_json)
            else:
                # Memory fallback
                self.memory_cache["hashes"][report_hash] = result
                return True
        except Exception as e:
            logger.error(f"Error caching report hash: {str(e)}")
            return False
    
    async def get_report_by_hash(self, report_hash: str) -> Optional[Dict[str, Any]]:
        """Get cached report by hash"""
        await self._ensure_initialized()
        
        try:
            if self.redis:
                result_json = await self.redis.get(f"tia:report:{report_hash}")
                if result_json:
                    return json.loads(result_json)
                return None
            else:
                # Memory fallback
                return self.memory_cache["hashes"].get(report_hash)
        except Exception as e:
            logger.error(f"Error retrieving report by hash: {str(e)}")
            return None
    
    async def get_similar_report(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Check if a similar report exists in cache.
        Uses exact hash matching and fuzzy matching based on key fields.
        """
        await self._ensure_initialized()
        
        try:
            # Try exact hash match first
            exact_hash = hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()
            exact_match = await self.get_report_by_hash(exact_hash)
            if exact_match:
                logger.info("Found exact cache match for report")
                return exact_match
            
            # Try fuzzy hash match (only project details and key fields)
            fuzzy_data = {
                "project_title": data.get("project_details", {}).get("project_title", ""),
                "site_address": data.get("project_details", {}).get("site_address", ""),
                "development_type": data.get("project_details", {}).get("development_type", ""),
                "council": data.get("project_details", {}).get("council", "")
            }
            
            if not any(fuzzy_data.values()):  # If no key fields, don't try fuzzy match
                return None
                
            fuzzy_hash = hashlib.md5(json.dumps(fuzzy_data, sort_keys=True).encode()).hexdigest()
            fuzzy_match = await self.get_report_by_hash(fuzzy_hash)
            if fuzzy_match:
                logger.info("Found fuzzy cache match for report")
                return fuzzy_match
                
            return None
        except Exception as e:
            logger.error(f"Error checking for similar report: {str(e)}")
            return None
    
    # Redis PubSub for streaming updates
    
    async def publish(self, channel: str, message: str) -> int:
        """Publish a message to a Redis channel"""
        await self._ensure_initialized()
        
        try:
            if self.redis:
                return await self.redis.publish(channel, message)
            else:
                # No-op for memory fallback
                logger.warning("Publish called but Redis is unavailable")
                return 0
        except Exception as e:
            logger.error(f"Error publishing to Redis: {str(e)}")
            return 0
    
    # Cache statistics and management
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        await self._ensure_initialized()
        
        try:
            stats = {
                "type": "redis" if self.redis else "memory",
                "sections": 0,
                "reports": 0,
                "jobs": 0
            }
            
            if self.redis:
                # Get counts from Redis
                sections = await self.redis.keys("tia:section:*")
                stats["sections"] = len(sections)
                
                reports = await self.redis.keys("tia:report:*")
                stats["reports"] = len(reports)
                
                jobs = await self.redis.keys("tia:job:*:status")
                stats["jobs"] = len(jobs)
            else:
                # Get counts from memory cache
                stats["sections"] = len(self.memory_cache["sections"])
                stats["reports"] = len(self.memory_cache["reports"])
                stats["jobs"] = len(self.memory_cache["jobs"])
            
            return stats
        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return {"error": str(e)}
    
    async def clear_cache(self, cache_type: str = "all") -> Dict[str, Any]:
        """Clear cache of specified type"""
        await self._ensure_initialized()
        
        try:
            result = {"cleared": True, "type": cache_type}
            
            if self.redis:
                if cache_type == "all" or cache_type == "sections":
                    await self.redis.delete(*await self.redis.keys("tia:section:*"))
                
                if cache_type == "all" or cache_type == "reports":
                    await self.redis.delete(*await self.redis.keys("tia:report:*"))
                
                if cache_type == "all" or cache_type == "jobs":
                    await self.redis.delete(*await self.redis.keys("tia:job:*"))
            else:
                # Clear memory cache
                if cache_type == "all" or cache_type == "sections":
                    self.memory_cache["sections"] = {}
                
                if cache_type == "all" or cache_type == "reports":
                    self.memory_cache["reports"] = {}
                    self.memory_cache["hashes"] = {}
                
                if cache_type == "all" or cache_type == "jobs":
                    self.memory_cache["jobs"] = {}
            
            return result
        except Exception as e:
            logger.error(f"Error clearing cache: {str(e)}")
            return {"error": str(e), "cleared": False}