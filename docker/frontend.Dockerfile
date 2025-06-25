FROM node:22-slim AS frontend-builder

WORKDIR /pubgm-hud/frontend

COPY frontend/package.json .

RUN npm install

COPY frontend/ .

RUN npm run build

FROM nginx:latest

# Copy the nginx configuration template
COPY docker/nginx.conf /etc/nginx/nginx.conf.template

# Copy the entrypoint script
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh

# Copy the built frontend files
COPY --from=frontend-builder /pubgm-hud/frontend/dist /var/www/html

# Make the entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
