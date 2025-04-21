#!/usr/bin/env python3
"""
Performance metrics collection for TIA Generator.
Tracks API calls, generation times, cache performance, etc.
"""

import time
import threading
import statistics
from typing import Dict, Any, List, Optional
from collections import defaultdict, deque

# Thread-local storage for request timing
import threading
_thread_local = threading.local()

# In-memory metrics storage
# Using deque with maxlen to avoid unlimited growth
_api_calls = defaultdict(lambda: deque(maxlen=1000))
_api_failures = defaultdict(lambda: deque(maxlen=100))
_section_generation_times = defaultdict(lambda: deque(maxlen=1000))
_section_failures = defaultdict(lambda: deque(maxlen=100))
_cache_hits = defaultdict(int)
_cache_misses = defaultdict(int)
_request_times = defaultdict(lambda: deque(maxlen=1000))
_progressive_updates = defaultdict(int)
_report_generation_times = deque(maxlen=1000)

# Lock for thread-safe updates
_metrics_lock = threading.RLock()

def init_metrics():
    """Initialize metrics system"""
    pass

def record_api_call(model: str, duration: float, tokens: int):
    """Record an API call to OpenAI"""
    with _metrics_lock:
        _api_calls[model].append({
            "timestamp": time.time(),
            "duration": duration,
            "tokens": tokens
        })

def record_api_failure(model: str, error: str):
    """Record an API call failure"""
    with _metrics_lock:
        _api_failures[model].append({
            "timestamp": time.time(),
            "error": error
        })

def record_section_generation(section: str, duration: float):
    """Record generation time for a section"""
    with _metrics_lock:
        _section_generation_times[section].append(duration)

def record_section_failure(section: str, error: str):
    """Record a section generation failure"""
    with _metrics_lock:
        _section_failures[section].append({
            "timestamp": time.time(),
            "error": error
        })

def record_cache_hit(section: str):
    """Record a cache hit for a section"""
    with _metrics_lock:
        _cache_hits[section] += 1

def record_cache_miss(section: str):
    """Record a cache miss for a section"""
    with _metrics_lock:
        _cache_misses[section] += 1

def record_request_time(endpoint: str, duration: float):
    """Record time to process a request"""
    with _metrics_lock:
        _request_times[endpoint].append(duration)

def record_progressive_update(section: str):
    """Record a progressive update sent to client"""
    with _metrics_lock:
        _progressive_updates[section] += 1

def record_full_report_generation(duration: float, section_count: int):
    """Record time to generate a full report"""
    with _metrics_lock:
        _report_generation_times.append({
            "timestamp": time.time(),
            "duration": duration,
            "section_count": section_count
        })

def calculate_stats(values: List[float]) -> Dict[str, float]:
    """Calculate statistics for a list of values"""
    if not values:
        return {
            "count": 0,
            "min": 0,
            "max": 0,
            "avg": 0,
            "median": 0,
            "p95": 0
        }
    
    sorted_values = sorted(values)
    p95_index = int(len(sorted_values) * 0.95)
    
    return {
        "count": len(values),
        "min": min(values),
        "max": max(values),
        "avg": statistics.mean(values),
        "median": statistics.median(values),
        "p95": sorted_values[p95_index if p95_index < len(sorted_values) else -1]
    }

def get_api_call_metrics() -> Dict[str, Any]:
    """Get metrics for API calls"""
    with _metrics_lock:
        metrics = {}
        
        # Calculate metrics for each model
        for model, calls in _api_calls.items():
            durations = [call["duration"] for call in calls]
            tokens = [call["tokens"] for call in calls]
            
            metrics[model] = {
                "calls": len(calls),
                "durations": calculate_stats(durations),
                "tokens": calculate_stats(tokens),
                "failures": len(_api_failures.get(model, []))
            }
            
        # Overall metrics
        all_durations = [call["duration"] for calls in _api_calls.values() for call in calls]
        
        # Only calculate if we have data
        if all_durations:
            metrics["overall"] = {
                "total_calls": sum(len(calls) for calls in _api_calls.values()),
                "total_failures": sum(len(failures) for failures in _api_failures.values()),
                "durations": calculate_stats(all_durations)
            }
        else:
            metrics["overall"] = {
                "total_calls": 0,
                "total_failures": 0,
                "durations": {"count": 0, "min": 0, "max": 0, "avg": 0, "median": 0, "p95": 0}
            }
            
        return metrics

def get_section_generation_metrics() -> Dict[str, Any]:
    """Get metrics for section generation"""
    with _metrics_lock:
        metrics = {}
        
        # Calculate metrics for each section
        for section, times in _section_generation_times.items():
            times_list = list(times)  # Convert deque to list
            metrics[section] = {
                "count": len(times_list),
                "times": calculate_stats(times_list),
                "failures": len(_section_failures.get(section, [])),
                "cache_hits": _cache_hits.get(section, 0),
                "progressive_updates": _progressive_updates.get(section, 0)
            }
            
        # Overall metrics
        all_times = [t for times in _section_generation_times.values() for t in times]
        
        if all_times:
            metrics["overall"] = {
                "total_sections": sum(len(times) for times in _section_generation_times.values()),
                "total_failures": sum(len(failures) for failures in _section_failures.values()),
                "total_cache_hits": sum(_cache_hits.values()),
                "times": calculate_stats(all_times)
            }
        else:
            metrics["overall"] = {
                "total_sections": 0,
                "total_failures": 0,
                "total_cache_hits": 0,
                "times": {"count": 0, "min": 0, "max": 0, "avg": 0, "median": 0, "p95": 0}
            }
            
        return metrics

def get_request_time_metrics() -> Dict[str, Any]:
    """Get metrics for request processing times"""
    with _metrics_lock:
        metrics = {}
        
        # Calculate metrics for each endpoint
        for endpoint, times in _request_times.items():
            times_list = list(times)  # Convert deque to list
            metrics[endpoint] = calculate_stats(times_list)
            
        # Overall metrics
        all_times = [t for times in _request_times.values() for t in times]
        
        if all_times:
            metrics["overall"] = {
                "total_requests": sum(len(times) for times in _request_times.values()),
                "times": calculate_stats(all_times)
            }
        else:
            metrics["overall"] = {
                "total_requests": 0,
                "times": {"count": 0, "min": 0, "max": 0, "avg": 0, "median": 0, "p95": 0}
            }
            
        return metrics

def get_report_generation_metrics() -> Dict[str, Any]:
    """Get metrics for full report generation"""
    with _metrics_lock:
        times = [report["duration"] for report in _report_generation_times]
        section_counts = [report["section_count"] for report in _report_generation_times]
        
        if times:
            return {
                "count": len(times),
                "times": calculate_stats(times),
                "section_counts": calculate_stats(section_counts),
                "reports_per_minute": 60 / calculate_stats(times)["avg"] if calculate_stats(times)["avg"] > 0 else 0
            }
        else:
            return {
                "count": 0,
                "times": {"count": 0, "min": 0, "max": 0, "avg": 0, "median": 0, "p95": 0},
                "section_counts": {"count": 0, "min": 0, "max": 0, "avg": 0, "median": 0, "p95": 0},
                "reports_per_minute": 0
            }

def get_cache_metrics() -> Dict[str, Any]:
    """Get metrics for cache performance"""
    with _metrics_lock:
        total_hits = sum(_cache_hits.values())
        total_misses = sum(_cache_misses.values())
        total_requests = total_hits + total_misses
        
        metrics = {
            "total_hits": total_hits,
            "total_misses": total_misses,
            "hit_ratio": total_hits / total_requests if total_requests > 0 else 0,
            "sections": {}
        }
        
        # Calculate metrics for each section
        for section in set(list(_cache_hits.keys()) + list(_cache_misses.keys())):
            hits = _cache_hits.get(section, 0)
            misses = _cache_misses.get(section, 0)
            total = hits + misses
            
            metrics["sections"][section] = {
                "hits": hits,
                "misses": misses,
                "hit_ratio": hits / total if total > 0 else 0
            }
            
        return metrics

def get_all_metrics() -> Dict[str, Any]:
    """Get all metrics"""
    return {
        "api_calls": get_api_call_metrics(),
        "section_generation": get_section_generation_metrics(),
        "request_times": get_request_time_metrics(),
        "report_generation": get_report_generation_metrics(),
        "cache": get_cache_metrics(),
        "timestamp": time.time()
    }

def reset_metrics():
    """Reset all metrics"""
    with _metrics_lock:
        global _api_calls, _api_failures, _section_generation_times, _section_failures
        global _cache_hits, _cache_misses, _request_times, _progressive_updates
        global _report_generation_times
        
        _api_calls = defaultdict(lambda: deque(maxlen=1000))
        _api_failures = defaultdict(lambda: deque(maxlen=100))
        _section_generation_times = defaultdict(lambda: deque(maxlen=1000))
        _section_failures = defaultdict(lambda: deque(maxlen=100))
        _cache_hits = defaultdict(int)
        _cache_misses = defaultdict(int)
        _request_times = defaultdict(lambda: deque(maxlen=1000))
        _progressive_updates = defaultdict(int)
        _report_generation_times = deque(maxlen=1000)