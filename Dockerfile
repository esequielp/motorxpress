# Stage 1: Build y dependencias
FROM node:20-alpine AS builder

WORKDIR /app

# Argumentos para compilación adaptable (White-label)
ARG VITE_APP_NAME
ARG VITE_THEME
ARG VITE_API_BASE_URL

ENV VITE_APP_NAME=${VITE_APP_NAME:-"Mi Tienda App"}
ENV VITE_THEME=${VITE_THEME:-marketplace}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-""}
ENV NODE_ENV=production

COPY package*.json ./
# Instalar dependencias
RUN npm ci

COPY . .

# Construcción de Vite (Frontend PWA) + Esbuild (Backend server.cjs)
RUN npm run build

# Stage 2: Runtime Minimalista
FROM node:20-alpine

WORKDIR /app

# Copiamos solo lo necesario desde la fase de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/database.sqlite ./database.sqlite

# Crear directorio de subidas si es necesario
RUN mkdir -p uploads

# Variables de producción
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Iniciamos el entorno Node.js
CMD ["npm", "run", "start"]
