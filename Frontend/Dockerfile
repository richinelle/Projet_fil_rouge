# ══════════════════════════════════════════
# STAGE 1 : BUILD React + Vite
# ══════════════════════════════════════════
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les dépendances en premier (optimise le cache Docker)
COPY package.json package-lock.json ./

RUN npm ci

# Copier tout le code source
COPY . .

# Build production Vite
RUN npm run build

# ══════════════════════════════════════════
# STAGE 2 : SERVE avec Nginx
# ══════════════════════════════════════════
FROM nginx:alpine AS production

# Supprimer config Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre config Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build Vite (toujours dans dist/)
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]