FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package.json turbo.json ./
COPY package-lock.json* ./

COPY apps/server ./apps/server
COPY apps/web ./apps/web
COPY apps/mobile ./apps/mobile
COPY packages ./packages

RUN rm -f package-lock.json
RUN npm install
RUN npm run build --workspace=@area/shared
RUN npm run build --workspace=web

FROM nginx:alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 8081

# SMART ENTRYPOINT:
# 1. Check if client.apk exists (provided by mobile_client via volume)
# 2. If NOT (Railway case), download it manually
# 3. Start Nginx
CMD sh -c "if [ ! -f /var/www/shared/client.apk ]; then \
        echo 'Web Service: APK not found (Volume empty). Downloading fallback...'; \
        curl -f -L -o /var/www/shared/client.apk https://github.com/Matyslgr/AREA/releases/latest/download/client.apk || \
        echo 'Dummy APK' > /var/www/shared/client.apk; \
    else \
        echo 'Web Service: APK found in volume (Provided by Mobile Service).'; \
    fi && \
    chmod 644 /var/www/shared/client.apk && \
    nginx -g 'daemon off;'"
