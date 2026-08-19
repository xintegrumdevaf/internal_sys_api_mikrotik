# Usamos Node.js LTS (v22) en Alpine para una imagen ligera
FROM node:22-alpine

WORKDIR /app

# Instalar pnpm en la versión especificada
RUN npm install -g pnpm@11.22.0

# Copiar archivos de configuración de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar TS y ejecutar Prisma con tsx)
RUN pnpm install --frozen-lockfile

# Copiar el código fuente y configuración de base de datos
COPY . .

# Generar el cliente de Prisma
RUN pnpm prisma generate

# Compilar TypeScript (compila en-place en src/ según tsconfig.json)
RUN pnpm run build

# Exponer el puerto de la API (puerto 3001 para evitar colisión con el 3000)
EXPOSE 3001

# Definir variables de entorno por defecto
ENV PORT=3001
ENV NODE_ENV=production

# Comando de arranque: ejecuta migraciones y luego inicia la API
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm run start"]
