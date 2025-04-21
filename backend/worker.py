#!/usr/bin/env python
import os
import redis
from rq import Worker, Connection

if __name__ == '__main__':
    redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
    redis_connection = redis.from_url(redis_url)
    
    with Connection(redis_connection):
        worker = Worker(['default'])
        worker.work()