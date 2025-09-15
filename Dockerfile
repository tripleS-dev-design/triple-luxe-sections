# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Copie le schéma AVANT generate
COPY prisma ./prisma
RUN npx prisma generate

# Build Remix
COPY . .
RUN npm run build

# ---------- RUNTIME ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000

# Copie le build, le server et TOUT node_modules (inclut le client Prisma généré)
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

CMD ["node", "server.js"]
