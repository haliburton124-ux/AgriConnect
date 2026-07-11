#!/bin/sh
set -e

echo "Starting AgriConnect API..."

# Link storage (ignore if already linked)
php artisan storage:link 2>/dev/null || true

# Run migrations when DB is available; don't block server startup
php artisan migrate --force || echo "WARN: migrations skipped or failed — check DB variables"

echo "Listening on port ${PORT:-8000}"
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
