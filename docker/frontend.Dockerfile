# Stage 1: Build the static assets
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with light-weight alpine node or static Nginx
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

RUN npm ci --omit=dev && npm install -g tsx

ENV NODE_ENV=production
EXPOSE 3000

CMD ["tsx", "server.ts"]
