
FROM node:20-alpine

WORKDIR /app


COPY package*.json ./
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads
RUN npm install --no-optional --no-fund

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
