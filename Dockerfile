# ---------- BASE ----------
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---------- DEPENDENCIES (dev + prod) ----------
FROM base AS deps
COPY package*.json ./
# installe TOUTES les deps (dev incluses) pour permettre le build
RUN npm ci

# ---------- BUILD ----------
FROM base AS build
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# optionnel: plus de logs si besoin
# ENV VITE_LOG_LEVEL=info
RUN npm run build

# ---------- RUNTIME (léger, prod only) ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# installe uniquement les deps prod
RUN npm ci --omit=dev && npm cache clean --force
# inutile en runtime
RUN npm remove @shopify/cli || true

# copie du build et des fichiers utiles
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/server.js ./server.js

EXPOSE 10000
# (facultatif) healthcheck interne au conteneur — Render peut utiliser le sien
# HEALTHCHECK --interval=30s --timeout=10s CMD wget -qO- http://127.0.0.1:10000/healthz || exit 1

CMD ["node", "server.js"]
