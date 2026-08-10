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

echo "Testing database connection..."
php artisan tinker --execute="try { DB::connection()->getPdo(); echo 'Database connection OK ('.DB::connection()->getDatabaseName().')'; } catch (Throwable \$e) { echo 'Database connection FAILED: '.\$e->getMessage(); }" 2>&1

# Run migrations when DB is available
echo "Running migrations..."
if ! php artisan migrate --force 2>&1; then
  echo "ERROR: migrations failed — check DB_HOST/DB_* and TiDB IP allowlist (allow 0.0.0.0/0 for Render)."
  exit 1
fi
echo "Migrations completed."

echo "Listening on port ${PORT:-8000}"
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
