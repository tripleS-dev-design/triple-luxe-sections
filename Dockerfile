# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl

# Installe TOUTES les deps (prod + dev) pour pouvoir builder
COPY package.json package-lock.json* ./
RUN npm ci

# Copie du code puis build
COPY . .
# (facultatif) évite certains toolings qui lisent NODE_ENV
ENV NODE_ENV=production
RUN npm run build

# ---------- RUNTIME ----------
FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production

# Installe UNIQUEMENT les deps de prod
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copie les artefacts nécessaires
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/server.js ./server.js

EXPOSE 10000
CMD ["node", "server.js"]
