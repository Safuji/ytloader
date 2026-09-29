FROM node:22-bookworm-slim

ENV NODE_ENV=production
ENV PORT=3000
ENV YT_DLP_JS_RUNTIME=node:/usr/local/bin/node

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip \
    && python3 -m pip install --no-cache-dir --break-system-packages "yt-dlp[default]" \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY public ./public

EXPOSE 3000

CMD ["node", "server.js"]
