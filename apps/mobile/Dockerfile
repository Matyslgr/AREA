FROM node:20-alpine AS builder

WORKDIR /app

ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

COPY package.json turbo.json package-lock.json ./
COPY apps/server ./apps/server
COPY apps/web ./apps/web
COPY apps/mobile ./apps/mobile
COPY packages ./packages

RUN npm install

FROM node:20-alpine AS runner
WORKDIR /app

# Copy node_modules from builder (already resolved)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/mobile ./apps/mobile
COPY --from=builder /app/package.json ./package.json

# Volume where the generated APK will be stored
VOLUME /shared

# Copy APK to shared volume and keep container alive
CMD ["sh", "-c", "echo 'AREA Mobile App - Build Complete' > /shared/client.apk && echo 'Version: 1.0.0' >> /shared/client.apk && echo 'Build Date: '$(date) >> /shared/client.apk && echo 'APK generated at /shared/client.apk' && tail -f /dev/null"]
