#!/bin/sh
set -e

# Copy public assets to shared volume
cp -a /var/www/html/public/. /var/www/html/public_shared/

php artisan migrate --force
php artisan db:seed --force
php artisan sync:api-data
php artisan optimize:clear

# Caching configuration
php artisan config:cache
php artisan event:cache
php artisan route:cache
php artisan view:cache

exec "$@"
