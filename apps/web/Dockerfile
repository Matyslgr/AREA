FROM node:20-alpine AS builder
WORKDIR /app

# Copiez les fichiers nécessaires pour la construction
COPY package.json turbo.json package-lock.json ./
COPY apps/server ./apps/server
COPY apps/web ./apps/web
COPY apps/mobile ./apps/mobile
COPY packages ./packages

# Installez les dépendances et construisez l'application
RUN npm install
RUN npm run build --workspace=web

# Étape finale : Conteneur minimal pour exécuter l'application
FROM node:20-alpine AS runner
WORKDIR /app

# Copiez les fichiers nécessaires depuis l'étape de construction
COPY --from=builder /app/apps/web/dist ./dist
COPY apps/web/package.json ./package.json

# Installez `serve` pour servir l'application
RUN npm install -g serve

EXPOSE 8081

# Commande pour démarrer l'application
CMD ["serve", "-s", "dist", "-l", "8081"]
