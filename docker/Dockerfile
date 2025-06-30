FROM node:22-slim

WORKDIR /pubgm-hud

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run db:generate
RUN npm run db:push

RUN npm run build

CMD ["npm", "run", "prod"]