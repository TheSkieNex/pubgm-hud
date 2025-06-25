FROM node:22-slim

# Create user and group properly
RUN groupadd -g 999 appuser && useradd -m -u 999 -g appuser appuser

WORKDIR /src

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

RUN chown -R appuser:appuser /src

USER appuser

CMD ["npm", "run", "prod"]