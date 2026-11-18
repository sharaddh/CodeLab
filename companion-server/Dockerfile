FROM node:20-slim

# Install toolchains for Run/Debug (python, java, g++)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    openjdk-17-jdk-headless \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Companion has no extra npm deps (uses built-ins + express from root? no, express is in root deps)
# Install express locally for the companion service
RUN npm init -y && npm install express@5

COPY server.js ./server.js

ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.js"]
