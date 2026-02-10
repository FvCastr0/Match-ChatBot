FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3001

# 1. Criamos o usuário e grupo primeiro
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 2. Criamos a pasta de cache ANTES de copiar os arquivos e já com o dono certo
# Isso evita o chown recursivo pesado depois
RUN mkdir -p /app/.next/cache && chown nextjs:nodejs /app/.next/cache

# 3. Copiamos os arquivos já definindo o usuário (Crucial para velocidade)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Removi o comando "COPY --from=builder /app/.next ./ .next" pois o standalone
# já lida com o que é necessário e você já copiou o static acima.

USER nextjs

EXPOSE 3001

CMD ["node", "server.js"]
