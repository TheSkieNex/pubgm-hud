#!/bin/sh
set -a
# Source .env file if it exists, otherwise use default values
if [ -f ../.env ]; then
    . ../.env
else
    # Set default values if .env doesn't exist
    DOMAIN=${DOMAIN:-localhost}
fi
set +a
envsubst '$DOMAIN' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
nginx -g 'daemon off;'
