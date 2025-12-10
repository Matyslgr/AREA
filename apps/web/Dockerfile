FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package.json turbo.json package-lock.json ./
COPY apps/server ./apps/server
COPY apps/web ./apps/web
COPY apps/mobile ./apps/mobile
COPY packages ./packages

RUN npm install
RUN npm run build --workspace=@area/shared
RUN npm run build --workspace=web

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/web/dist ./dist
COPY apps/web/package.json ./package.json

RUN npm install -g serve

EXPOSE 8081

CMD ["serve", "-s", "dist", "-l", "8081"]
