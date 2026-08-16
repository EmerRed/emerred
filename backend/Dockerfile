FROM node:20-alpine

WORKDIR /app

# Copiar package.json desde backend/
COPY backend/package*.json ./

RUN npm ci --only=production

# Copiar solo el código de backend/
COPY backend/src ./src
COPY backend/server.js ./

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
