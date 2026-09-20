FROM node:24.21.0-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=http://api.friendly-e-shop.local
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build
FROM nginxinc/nginx-unprivileged:1.30.5-alpine3.24
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
