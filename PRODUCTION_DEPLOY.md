# Production Deployment Guide

## Unified Docker Compose Setup

Tất cả cấu hình dev và production giờ nằm trong **1 file duy nhất**: `docker-compose.yml`

## Quick Start

### Development Mode
```bash
# Using default dev profile
docker-compose --profile dev up --build

# Or simpler
docker-compose up --build
```

### Production Mode
```bash
# Using production profile
docker-compose --profile prod up -d --build

# With env file
docker-compose --profile prod --env-file .env.prod up -d --build
```

## Configuration Files

- `.env` - Development environment variables
- `.env.prod` - Production environment variables  
- `backend/.env` - Backend dev config
- `backend/.env.production` - Backend prod config

## Services

### Development Profile (`dev`)
- `nginx` - Reverse proxy on port 80
- `backend` - API on port 5000 (direct access + via nginx)
- `frontend` - Next.js on port 3000 (direct access + via nginx)
- Hot reload enabled
- Source code mounted as volumes

### Production Profile (`prod`)
- `nginx-prod` - Optimized nginx with SSL support
- `backend-prod` - Compiled backend with health checks
- `frontend-prod` - Standalone Next.js build
- No direct port access (only via nginx)
- Auto-restart policies
- Health monitoring

## Environment Variables

### Development
```bash
NODE_ENV=development
BACKEND_PORT=5000
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Production
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost/api
```

## Access URLs

### Development
- Frontend: http://localhost:3000 (direct) or http://localhost (via nginx)
- Backend: http://localhost:5000 (direct) or http://localhost/api (via nginx)

### Production
- Frontend: http://localhost (via nginx only)
- Backend: http://localhost/api (via nginx only)
- Health: http://localhost/health

## Common Commands

```bash
# Build specific profile
docker-compose --profile dev build
docker-compose --profile prod build

# Start in background
docker-compose --profile dev up -d
docker-compose --profile prod up -d

# View logs
docker-compose --profile dev logs -f
docker-compose --profile prod logs -f backend-prod

# Stop services
docker-compose --profile dev down
docker-compose --profile prod down

# Restart specific service
docker-compose --profile prod restart backend-prod

# Check status
docker-compose --profile prod ps
```

## Health Checks (Production Only)

Backend and frontend have automatic health monitoring:
- Check interval: 30s
- Timeout: 10s  
- Retries: 3
- Auto-restart on failure

## HTTPS Setup (Production)

1. Uncomment SSL volume mount in `docker-compose.yml`:
```yaml
volumes:
  - ./nginx/ssl:/etc/nginx/ssl:ro
```

2. Update `nginx/nginx.prod.conf` with your domain

3. Add SSL certificates to `nginx/ssl/`

4. Restart nginx:
```bash
docker-compose --profile prod restart nginx-prod
```

## Switching Environments

```bash
# Stop current environment
docker-compose down

# Start different environment
docker-compose --profile prod up -d
```

## Key Production Features

✅ Multi-stage builds (smaller images)
✅ Production dependencies only
✅ Non-root user for security
✅ Health checks & auto-restart
✅ Gzip compression
✅ Rate limiting
✅ Static file caching
✅ Security headers
✅ No direct port exposure
