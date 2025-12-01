#!/bin/bash
set -e

# Run custom commands here if needed
# Execute the main container command
cp .env.dev .env
php artisan migrate --force
php artisan db:seed --force
# php artisan sync:api-data
php artisan optimize:clear

# Caching configuration
# php artisan config:cache
# php artisan event:cache
# php artisan route:cache
# php artisan view:cache

exec "$@"
