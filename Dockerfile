# Base stage for building the static files
FROM node:20-slim AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage for serving the application
FROM nginx:mainline-alpine-slim AS runtime
COPY --from=base /app/dist /usr/share/nginx/html
EXPOSE 80
