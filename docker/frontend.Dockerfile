FROM node:22-slim

WORKDIR /pubgm-hud/frontend

COPY frontend/package.json .

RUN npm install

COPY frontend/ .

RUN npm run build

RUN apt-get update && apt-get install -y nginx
