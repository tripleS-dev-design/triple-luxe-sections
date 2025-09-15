# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app

# 1) installer toutes les deps (y compris dev) pour pouvoir builder
COPY package.json package-lock.json ./
RUN npm ci

# 2) générer Prisma client pour le build (si ton code importe @prisma/client)
COPY prisma ./prisma
RUN npx prisma generate

# 3) copier le code et builder Remix
COPY . .
RUN npm run build

# ---------- RUNTIME ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# 4) installer seulement les deps prod
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force && npm remove @shopify/cli || true

# 5) copier les artefacts du build
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/server.js ./server.js
# (et tes fichiers server requis à l'exécution)
COPY --from=build /app/app ./app
COPY --from=build /app/prisma ./prisma

# 6) Render expose 10000 par défaut
EXPOSE 10000

# 7) IMPORTANT : créer la table Prisma en runtime (sqlite éphémère sur Render)
CMD ["sh","-c","npx prisma migrate deploy && node server.js"]
