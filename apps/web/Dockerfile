FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json turbo.json package-lock.json ./
COPY apps/server ./apps/server
COPY apps/web ./apps/web
COPY apps/mobile ./apps/mobile
COPY packages ./packages

RUN npm install
RUN npm run build --workspace=web

FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/apps/web/dist ./dist

EXPOSE 8081

# -s dist : Serve folder "dist"
# -l 8081 : On port 8081
CMD ["serve", "-s", "dist", "-l", "8081"]
