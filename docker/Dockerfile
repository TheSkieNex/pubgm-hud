FROM node:22-bullseye

WORKDIR /pubgm-hud

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "prod"]