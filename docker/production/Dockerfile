# Syntax=docker/dockerfile:1

# 1. Vendor Stage
FROM composer:2.6 as vendor

WORKDIR /app

COPY database/ database/
COPY composer.json composer.lock ./

RUN composer install \
	--no-interaction \
	--no-plugins \
	--no-scripts \
	--no-dev \
	--prefer-dist \
	--ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize

# 2. Frontend Stage
FROM node:22-alpine as frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY .env.prod .env
RUN npm run build

# 3. Final Stage
FROM php:8.3-fpm-alpine as final

# Install system dependencies
RUN apk add --no-cache \
	acl \
	fcgi \
	file \
	gettext \
	git \
	gnu-libiconv \
	icu-dev \
	libzip-dev \
	postgresql-dev

# Install PHP extensions
RUN docker-php-ext-install \
	intl \
	pdo_pgsql \
	zip \
	opcache

# Configure PHP
COPY docker/production/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/production/php/php.ini /usr/local/etc/php/conf.d/app.ini

# Configure PHP-FPM
COPY docker/production/php/www.conf /usr/local/etc/php-fpm.d/www.conf

WORKDIR /var/www/html

# Copy application code
COPY . .
COPY --from=vendor /app/vendor/ /var/www/html/vendor/
COPY --from=frontend /app/public/build/ /var/www/html/public/build/

# Set permissions
RUN chmod -R 775 storage bootstrap/cache && \
	chown -R www-data:www-data storage bootstrap/cache

# Entrypoint
COPY docker/production/entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

ENTRYPOINT ["docker-entrypoint"]
CMD ["php-fpm"]
