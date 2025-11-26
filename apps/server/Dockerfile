FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json turbo.json package-lock.json ./

COPY apps/server ./apps/server
COPY apps/web ./apps/web
COPY apps/mobile ./apps/mobile
COPY packages ./packages

RUN npm install

RUN npm run build --workspace=server

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/apps/server/prisma ./apps/server/prisma

# Generate Prisma Client
RUN npx prisma generate --schema=./apps/server/prisma/schema.prisma

EXPOSE 8080

# On lance le serveur
CMD ["node", "apps/server/dist/index.js"]
