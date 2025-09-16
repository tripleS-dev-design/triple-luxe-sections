# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app

# 1) Installe toutes les deps (dev incluses) pour builder Remix
COPY package.json package-lock.json ./
RUN npm ci

# 2) Génère Prisma client (si @prisma/client est importé au build)
COPY prisma ./prisma
RUN npx prisma generate

# 3) Copie le code et build Remix
COPY . .
RUN npm run build

# ---------- RUNTIME ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# 4) Installe seulement les deps prod
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force && npm remove @shopify/cli || true

# 5) Copie les artefacts du build + sources nécessaires au runtime
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/app ./app
COPY --from=build /app/prisma ./prisma

EXPOSE 10000

# 6) Crée les tables Prisma au démarrage (sqlite sur Render = éphémère)
CMD ["sh","-c","npx prisma migrate deploy && node server.js"]
