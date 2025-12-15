# Hướng dẫn Deploy lên Railway

## Tổng quan

Dự án Japanese Listening Trainer là một monorepo gồm:
- **Backend**: Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: Next.js 16 + React 19 + TypeScript

## Các bước Deploy

### 1. Chuẩn bị Repository

1. Đảm bảo code đã được push lên GitHub/GitLab
2. Tất cả các file cấu hình Railway đã được tạo:
   - `railway.json` (root)
   - `backend/railway.json`
   - `backend/Dockerfile.production`
   - `frontend/railway.json`
   - `frontend/Dockerfile.production`

### 2. Tạo Project trên Railway

1. Truy cập [railway.app](https://railway.app)
2. Đăng nhập bằng GitHub
3. Click **"New Project"**
4. Chọn **"Deploy from GitHub repo"**
5. Chọn repository của bạn

### 3. Deploy Database (PostgreSQL)

1. Trong Railway project, click **"+ New"**
2. Chọn **"Database" → "PostgreSQL"**
3. Railway sẽ tự động tạo database và các environment variables:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

### 4. Deploy Backend

1. Click **"+ New"** → **"GitHub Repo"**
2. Chọn repository
3. Railway sẽ detect monorepo. Trong **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
4. Thêm **Environment Variables**:

```env
# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}

# Node
NODE_ENV=production
PORT=5000
```

5. Deploy service
6. Sau khi deploy xong, chạy migration:
   - Vào **Settings** → **Deploy** → **Custom Start Command**
   - Tạm thời đổi command thành: `npx prisma migrate deploy && npm run start`
   - Hoặc dùng Railway CLI: `railway run npx prisma migrate deploy`

### 5. Deploy Frontend

1. Click **"+ New"** → **"GitHub Repo"**
2. Chọn repository (same repo)
3. Trong **Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
4. Thêm **Environment Variables**:

```env
# API URL
NEXT_PUBLIC_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api

# Node
NODE_ENV=production
```

5. Deploy service

### 6. Cấu hình Domain (Optional)

Railway tự động tạo domain dạng: `xxx.railway.app`

Nếu muốn custom domain:
1. Vào service → **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Thêm domain của bạn và cấu hình DNS

### 7. Kiểm tra Deploy

#### Backend Health Check:
```bash
curl https://your-backend.railway.app/api/health
```

#### Frontend:
Truy cập: `https://your-frontend.railway.app`

## Environment Variables Chi Tiết

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| JWT_SECRET | Secret key cho JWT | `your-secret-key-min-32-chars` |
| JWT_EXPIRES_IN | Token expiration time | `7d` |
| CORS_ORIGIN | Frontend URL | `https://your-frontend.railway.app` |
| NODE_ENV | Environment | `production` |
| PORT | Server port | `5000` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | `https://your-backend.railway.app/api` |
| NODE_ENV | Environment | `production` |

## Troubleshooting

### Build Failed

1. Kiểm tra logs trong Railway dashboard
2. Đảm bảo `package.json` có đầy đủ dependencies
3. Kiểm tra Node version (project dùng Node 20)

### Database Connection Error

1. Đảm bảo `DATABASE_URL` được set đúng
2. Kiểm tra Prisma schema có matching với database
3. Chạy migration: `npx prisma migrate deploy`

### CORS Error

1. Đảm bảo `CORS_ORIGIN` trong backend match với frontend URL
2. Kiểm tra frontend đang gọi đúng `NEXT_PUBLIC_API_URL`

### Frontend không connect được Backend

1. Kiểm tra `NEXT_PUBLIC_API_URL` có đúng không
2. Đảm bảo backend service đang running
3. Test backend health endpoint trước

## Monitoring & Logs

- Railway Dashboard → Service → **Logs**
- Xem real-time logs và errors
- Set up alerts nếu cần

## Backup & Rollback

Railway tự động giữ lại deployments history:
1. Vào **Deployments** tab
2. Click vào deployment muốn rollback
3. Click **"Rollback"**

## Auto-Deploy

Railway tự động deploy khi push code:
1. Push code lên GitHub
2. Railway detect changes
3. Auto build và deploy

Để tắt auto-deploy:
- Vào **Settings** → **Service** → Tắt **"Auto Deploy"**

## Database Migrations

Để chạy migration khi deploy:

**Option 1**: Custom Start Command
```bash
npx prisma migrate deploy && npm run start
```

**Option 2**: Railway CLI
```bash
railway run npx prisma migrate deploy
```

**Option 3**: Add to package.json
```json
"scripts": {
  "start": "npx prisma migrate deploy && node dist/server.js"
}
```

## Seeding Database (Optional)

Nếu cần seed data:
```bash
railway run npm run seed
```

## Cost Optimization

Railway free tier:
- $5 credit/month
- Sau khi hết credit, services sẽ sleep

Tips:
- Remove unused services
- Monitor usage trong Dashboard
- Optimize build times

## Security Checklist

- [ ] Đổi `JWT_SECRET` thành giá trị bảo mật
- [ ] Set đúng `CORS_ORIGIN`
- [ ] Không commit `.env` files
- [ ] Enable Railway 2FA
- [ ] Regular backup database
- [ ] Monitor logs for suspicious activities

## Useful Commands

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run command on Railway
railway run <command>

# Environment variables
railway variables
```

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app
