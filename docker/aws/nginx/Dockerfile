# 1. Build Frontend Assets
FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
COPY .env.prod .env
RUN npm run build

# 2. Nginx Stage
FROM nginx:alpine

# Remove default config and html
RUN rm -rf /etc/nginx/conf.d/*
RUN rm -rf /usr/share/nginx/html/*

COPY docker/production/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY public /var/www/html/public
# Overwrite with built assets
COPY --from=frontend /app/public/build /var/www/html/public/build
