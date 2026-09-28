# ---------- Builder stage ----------
FROM node:20-slim AS builder

# Parche de seguridad para Debian (reemplaza a apk de Alpine)
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Activa pnpm de forma nativa e instantánea
RUN corepack enable pnpm

WORKDIR /app

# Copia todo el código fuente
COPY . .

# Instala dependencias, genera el cliente de Prisma y compila NestJS
RUN pnpm install --frozen-lockfile
RUN npx prisma generate
RUN pnpm run build

# ---------- Production stage ----------
FROM node:20-slim AS production

# Parche de seguridad para la imagen final
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Activa pnpm
RUN corepack enable pnpm

WORKDIR /app

# Copia estrictamente los archivos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instala solo las dependencias de producción (Aquí fallaba el código 139)
RUN pnpm install --prod --frozen-lockfile

# Trae los archivos compilados y el esquema de Prisma desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# (El CMD lo sigue inyectando tu docker-compose.yml)