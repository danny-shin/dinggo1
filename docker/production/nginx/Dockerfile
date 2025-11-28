FROM nginx:alpine

FROM nginx:alpine

# Remove default config and html
RUN rm -rf /etc/nginx/conf.d/*
RUN rm -rf /usr/share/nginx/html/*

COPY docker/production/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY public /var/www/html/public
