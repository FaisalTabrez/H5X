FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY scripts/ ./scripts/
COPY src/ ./src/
COPY static/ ./static/
COPY data/ ./data/
# Use the checked-in, validated snapshot; no CTFtime request during a build.
RUN npm run build:pages && npm run check:site

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY devops/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out/ /usr/share/nginx/html/
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
