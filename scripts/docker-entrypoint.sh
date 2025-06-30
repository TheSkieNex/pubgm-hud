#!/bin/sh
set -a
# Source .env file if it exists, otherwise use default values
if [ -f /pubgm-hud/.env ]; then
    . /pubgm-hud/.env
else
    # Set default values if .env doesn't exist
    DOMAIN=${DOMAIN:-localhost}
    EMAIL=${EMAIL:-your-email@example.com}
fi
set +a

# Generate nginx configuration
envsubst '$DOMAIN' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Kill any existing nginx processes (just in case)
pkill nginx 2>/dev/null

# Generate SSL certificate if DOMAIN is not localhost
if [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "127.0.0.1" ]; then
    echo "Attempting to generate SSL certificate for domain: $DOMAIN"
    
    # Check if certificate already exists
    if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        echo "Certificate not found. Generating new certificate..."
        certbot certonly --standalone --non-interactive --agree-tos --email $EMAIL -d $DOMAIN
    else
        echo "Certificate already exists. Renewing if necessary..."
        certbot renew --quiet
    fi
    
    # Reload nginx to use new certificates
    nginx -s reload
fi

# Start nginx in the foreground (this keeps the container running)
exec nginx -g 'daemon off;'
