# ---------- BUILD ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copia apenas os arquivos de dependência
COPY package.json package-lock.json ./

# Instala exatamente o que está no lockfile
RUN npm ci

# Copia o resto do projeto
COPY . .

# Build do projeto
RUN npm run build


# ---------- PROD ----------
FROM nginx:alpine

# Remove config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia build
COPY --from=build /app/dist /usr/share/nginx/html

# Copia config do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
