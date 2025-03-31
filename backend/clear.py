import os
import redis
from rq import Queue
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from your .env file if needed

redis_url = os.getenv("REDIS_URL")
conn = redis.from_url(redis_url)
q = Queue("default", connection=conn)

# This will remove all jobs from the queue.
q.empty()

print("All jobs have been cleared from the queue.")
