FROM node:24.21.0-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=https://api.friendly-e-shop.duckdns.org
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm test
FROM nginxinc/nginx-unprivileged:1.30.5-alpine3.24
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
