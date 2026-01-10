# Deployment Guide

最简单的部署方式：**Railway**（后端 + 数据库）+ **Vercel**（前端）

## 方案一：Railway + Vercel（推荐）

### 1. 部署后端到 Railway

1. 注册 [Railway](https://railway.app)
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的 oddslab 仓库
4. Railway 会自动检测到项目，选择 `backend` 目录

**配置环境变量：**
```
DATABASE_URL=（Railway 自动提供）
JWT_SECRET=your-production-secret-key
PORT=3001
NODE_ENV=production
```

**添加 PostgreSQL：**
- 在 Railway 项目中点击 "New" → "Database" → "PostgreSQL"
- Railway 会自动设置 DATABASE_URL

**配置 Build：**
在 Railway Settings 中设置：
- Root Directory: `backend`
- Build Command: `pnpm install && npx prisma generate && npx prisma migrate deploy && pnpm build`
- Start Command: `pnpm start`

### 2. 部署前端到 Vercel

1. 注册 [Vercel](https://vercel.com)
2. 点击 "New Project" → 导入 GitHub 仓库
3. 配置：
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`

**配置环境变量：**
```
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 方案二：全部用 Railway

如果想更简单，可以全部部署到 Railway：

1. 后端服务（同上）
2. 前端服务：
   - Root Directory: `frontend`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm preview --host --port $PORT`

---

## 方案三：Docker Compose（VPS）

如果你有 VPS（如阿里云、腾讯云），可以用 Docker：

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: oddslab
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/oddslab
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3001
      NODE_ENV: production
    depends_on:
      - postgres
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      VITE_API_URL: https://your-domain.com/api
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - frontend
    restart: always

volumes:
  postgres_data:
```

### backend/Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN npx prisma generate
RUN pnpm build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && pnpm start"]
```

### frontend/Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

---

## 快速开始（Railway）

```bash
# 1. 推送代码到 GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. 在 Railway 创建项目
# - 导入 GitHub 仓库
# - 添加 PostgreSQL 数据库
# - 设置 backend 为 Root Directory
# - 添加环境变量

# 3. 在 Vercel 创建项目
# - 导入同一个 GitHub 仓库
# - 设置 frontend 为 Root Directory
# - 添加 VITE_API_URL 环境变量
```

---

## 环境变量清单

### Backend (Railway)
| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接串（Railway 自动提供） |
| `JWT_SECRET` | JWT 签名密钥（生成一个随机字符串） |
| `PORT` | 端口（Railway 自动设置） |
| `NODE_ENV` | `production` |

### Frontend (Vercel)
| 变量 | 说明 |
|------|------|
| `VITE_API_URL` | 后端 API 地址，如 `https://xxx.railway.app/api` |

---

## 生成 JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 部署后检查

1. 访问前端 URL，确认页面加载
2. 测试注册/登录功能
3. 创建房间，添加地址
4. 测试公开房间访问

---

## 费用参考

| 平台 | 免费额度 |
|------|----------|
| Railway | $5/月免费额度 |
| Vercel | 免费（个人项目） |
| Render | 免费（会休眠） |

推荐先用 Railway + Vercel 的免费额度测试，后续根据流量再升级。
