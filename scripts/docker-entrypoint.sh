#!/bin/sh
set -a
# Source .env file if it exists, otherwise use default values
if [ -f /pubgm-hud/.env ]; then
    . /pubgm-hud/.env
else
    # Set default values if .env doesn't exist
    DOMAIN=${DOMAIN:-localhost}
fi
set +a

# Create certbot webroot directory
mkdir -p /var/www/certbot

# Generate nginx configuration
envsubst '$DOMAIN' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start nginx in background
nginx

# Generate SSL certificate if DOMAIN is not localhost
if [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "127.0.0.1" ]; then
    echo "Attempting to generate SSL certificate for domain: $DOMAIN"
    
    # Check if certificate already exists
    if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        echo "Certificate not found. Generating new certificate..."
        certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" -d "api.$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN
    else
        echo "Certificate already exists. Renewing if necessary..."
        certbot renew --quiet
    fi
    
    # Reload nginx to use new certificates
    nginx -s reload
fi

# Keep container running
exec "$@"
