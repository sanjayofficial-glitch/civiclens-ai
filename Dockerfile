# Dockerfile for deploying the built Vite app (e.g. via Nginx if not using Firebase Hosting)
# Though Firebase Hosting is preferred, this is provided for containerized environments (Cloud Run).

FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo config
COPY package*.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build web app
RUN npx turbo run build --filter=web

# Production server
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# SPA fallback configuration
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
