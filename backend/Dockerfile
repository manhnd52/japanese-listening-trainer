# Multi-stage Dockerfile for Backend (Dev & Production)
ARG NODE_ENV=development

# Development stage
FROM node:20-alpine AS development

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

# Builder stage for production
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
COPY src/prisma ./src/prisma

RUN npm ci --only=production && \
    npm cache clean --force

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/prisma ./src/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma.config.ts ./

RUN mkdir -p uploads && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]

# Final stage selector
FROM ${NODE_ENV} AS final