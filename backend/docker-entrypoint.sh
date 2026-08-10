#!/bin/sh
set -e

echo "Starting AgriConnect API..."

# Ensure Laravel writable directories exist
mkdir -p \
  bootstrap/cache \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  storage/app/public
chmod -R 775 bootstrap/cache storage

# Link storage (ignore if already linked)
php artisan storage:link 2>/dev/null || true

# Run migrations when DB is available
echo "Running migrations..."
if php artisan migrate --force 2>&1; then
  echo "Migrations completed."
else
  echo "ERROR: migrations failed — check DB_HOST/DB_* and TiDB IP allowlist (allow 0.0.0.0/0 for Render)."
fi

echo "Listening on port ${PORT:-8000}"
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
