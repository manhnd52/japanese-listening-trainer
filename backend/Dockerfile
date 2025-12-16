FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma.config.ts ./
COPY src/prisma ./src/prisma

ENV DATABASE_URL="postgres://39bab5d58157b223ee1fc0a0504937013471f85504d233be77c050c188136658:sk_GjaLYKO9rtpmsLFqw_JMY@db.prisma.io:5432/postgres?sslmode=require"

RUN npx prisma generate

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]