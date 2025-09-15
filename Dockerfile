# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app

# dépendances (inclure devDeps pour avoir la CLI prisma)
COPY package.json package-lock.json* ./
RUN npm ci

# code + prisma
COPY . .
# génère le client Prisma et build Remix
RUN npx prisma generate
RUN npm run build

# ---------- RUNTIME ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 10000

# on copie node_modules (contient aussi la CLI prisma), le build, prisma, public, server.js
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/public ./public
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/package.json ./package.json

# démarrage: crée/maj le schéma DB puis lance le serveur
CMD ["npm", "run", "docker-start"]
