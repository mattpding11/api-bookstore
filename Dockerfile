# ---------- Builder stage ----------
FROM node:20-slim AS builder

# Parche de seguridad para Debian (reemplaza a apk de Alpine) + OpenSSL, requerido por el query engine de Prisma
RUN apt-get update && apt-get upgrade -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Activa pnpm de forma nativa e instantánea
RUN corepack enable pnpm

WORKDIR /app

# Copia todo el código fuente
COPY . .

# Instala dependencias, genera el cliente de Prisma y compila NestJS
RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate
RUN pnpm run build

# ---------- Production stage ----------
FROM node:20-slim AS production

# Parche de seguridad para la imagen final + OpenSSL, requerido por el query engine de Prisma
RUN apt-get update && apt-get upgrade -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Activa pnpm
RUN corepack enable pnpm

WORKDIR /app

# Copia estrictamente los archivos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instala solo las dependencias de producción (Aquí fallaba el código 139)
RUN pnpm install --prod --frozen-lockfile

# Trae los archivos compilados, el esquema y la config de Prisma (define datasource.url) desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# El "pnpm install --prod" de arriba no trae el cliente generado del builder; hay que regenerarlo aquí
RUN pnpm exec prisma generate

CMD ["bash", "-c", "pnpm exec prisma db push && pnpm exec prisma db seed && node dist/main.js"]

# (El CMD lo sigue inyectando tu docker-compose.yml)