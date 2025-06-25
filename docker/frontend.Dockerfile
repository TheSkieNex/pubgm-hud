FROM node:22-slim AS frontend-builder

WORKDIR /pubgm-hud/frontend

COPY frontend/package.json .

RUN npm install

COPY frontend/ .

RUN npm run build

FROM nginx:latest

COPY docker/nginx.conf /etc/nginx/nginx.conf.template

COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh

COPY --from=frontend-builder /pubgm-hud/frontend/dist /var/www/html

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]