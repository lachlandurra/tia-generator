#!/bin/bash
# Start the web server in the background (daemonized)
gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120 --workers 4 --daemon

# Start the RQ worker (with scheduler if needed)
rq worker --url $REDIS_URL --with-scheduler
