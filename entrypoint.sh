#!/bin/sh

# Change directory to the Django app directory containing manage.py
cd /app/emergency_response

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Seeding initial mock data..."
python manage.py seed_data

echo "Starting Gunicorn server..."
exec uvicorn config.asgi:application --host 0.0.0.0 --port 8000
