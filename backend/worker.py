#!/usr/bin/env python
import os
import redis
from rq import Worker, Queue

if __name__ == '__main__':
    # Get Redis connection
    redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
    redis_conn = redis.from_url(redis_url)
    
    # Create a queue and worker
    queue = Queue('default', connection=redis_conn)
    worker = Worker([queue], connection=redis_conn)
    
    print("Starting RQ worker...")
    print(f"Redis URL: {redis_url.split('@')[-1]}")  # Only show host part for security
    
    # Start the worker
    worker.work()