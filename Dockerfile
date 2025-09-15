# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app

# 1) deps (inclut devDeps)
COPY package*.json ./
RUN npm ci

# 2) code
COPY . .

# 3) build (avec devDeps)
ENV NODE_ENV=development
RUN npm run build

# ---------- RUNTIME ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# Render utilise PORT=10000
ENV NODE_ENV=production
ENV PORT=10000

# Fichiers nécessaires à l'exécution
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/app ./app
COPY --from=build /app/package*.json ./

# Installer uniquement les deps de prod
RUN npm ci --omit=dev

EXPOSE 10000
CMD ["node", "server.js"]
