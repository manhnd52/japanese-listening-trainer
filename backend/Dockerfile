FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma.config.ts ./
COPY src/prisma ./src/prisma

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npx prisma generate

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]