FROM node:22-slim AS frontend-builder

WORKDIR /pubgm-hud/frontend

COPY frontend/package.json .

RUN npm install

COPY frontend/ .

RUN npm run build

FROM nginx:latest

RUN apt-get update && \
    apt-get install -y certbot python3-certbot-nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy nginx configuration template
COPY docker/nginx.conf /etc/nginx/nginx.conf.template

# Copy entrypoint script
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh

# Copy built frontend files
COPY --from=frontend-builder /pubgm-hud/frontend/dist /var/www/html

# Make entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Create directory for SSL certificates
RUN mkdir -p /etc/letsencrypt

# Expose ports
EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]