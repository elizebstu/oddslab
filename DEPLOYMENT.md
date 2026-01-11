# Oddslab Docker 部署指南

本指南说明如何使用 Docker 将 Oddslab 部署到服务器。

## 架构概览

应用包含三个 Docker 容器：
- **oddslab-postgres**: PostgreSQL 数据库（端口 5432）
- **oddslab-backend**: Express API 服务（端口 3001）
- **oddslab-frontend**: Nginx 前端服务（端口 80）

## 前置要求

1. 服务器已安装 Docker 和 Docker Compose
2. 服务器开放端口 80（前端）和 3001（可选，仅需后端直接访问时）
3. 已配置域名（可选）

## 部署步骤

### 1. 克隆代码到服务器

```bash
git clone <repository-url> oddslab
cd oddslab
```

### 2. 配置环境变量

在服务器上设置 JWT_SECRET 环境变量：

```bash
# 生成随机密钥
export JWT_SECRET=$(openssl rand -base64 32)

# 或者设置自定义密钥
export JWT_SECRET="your-secure-secret-key"
```

**重要**: 生产环境必须使用强随机密钥，不要使用默认值！

### 3. 构建并启动所有服务

```bash
cd backend
docker-compose up -d
```

这将：
- 创建 PostgreSQL 容器并初始化数据库
- 构建后端镜像并运行数据库迁移
- 构建前端镜像并启动 Nginx

### 4. 验证部署

检查所有容器是否正常运行：

```bash
docker ps
```

应该看到三个容器都在运行：
- oddslab-postgres (healthy)
- oddslab-backend
- oddslab-frontend

查看后端日志：
```bash
docker logs oddslab-backend
```

查看前端日志：
```bash
docker logs oddslab-frontend
```

### 5. 访问应用

- 前端: `http://your-server-ip` 或 `http://your-domain.com`
- API: `http://your-server-ip/api` 或 `http://your-domain.com/api`

## 服务端口映射

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|---------|---------|------|
| Frontend | 80 | 80 | Web 界面 |
| Backend | 3001 | 3001 | API 服务 |
| PostgreSQL | 5432 | 5432 | 数据库 |

**注意**: Nginx 已配置 `/api` 路径代理到后端，所以前端和 API 都通过端口 80 访问。

## 常用命令

### 查看容器状态
```bash
docker ps
```

### 查看日志
```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker logs -f oddslab-backend
docker logs -f oddslab-frontend
docker logs -f oddslab-postgres
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
docker-compose restart frontend
```

### 停止服务
```bash
docker-compose down
```

### 停止服务并删除数据卷（警告：会删除所有数据）
```bash
docker-compose down -v
```

### 重新构建镜像
```bash
# 重新构建所有服务
docker-compose build

# 重新构建特定服务
docker-compose build backend
docker-compose build frontend

# 重新构建并启动
docker-compose up -d --build
```

### 执行数据库迁移（如果需要手动运行）
```bash
docker exec oddslab-backend npx prisma migrate deploy
```

### 访问数据库
```bash
docker exec -it oddslab-postgres psql -U postgres -d oddslab
```

## 更新部署

当代码有更新时：

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并启动
cd backend
docker-compose up -d --build
```

## 配置 HTTPS（使用 Nginx + Let's Encrypt）

### 方案 1: 在主机上配置 Nginx 反向代理

1. 在主机安装 Nginx 和 Certbot
2. 配置 Nginx 反向代理到容器端口 80
3. 使用 Certbot 申请 SSL 证书

### 方案 2: 修改容器内 Nginx 配置

1. 更新 `frontend/nginx.conf` 添加 SSL 配置
2. 挂载 SSL 证书到容器
3. 修改 `docker-compose.yml` 映射端口 443

## 环境变量说明

### Backend 环境变量

在 `docker-compose.yml` 中配置：

```yaml
environment:
  DATABASE_URL: postgresql://postgres:postgres@postgres:5432/oddslab
  JWT_SECRET: ${JWT_SECRET:-your-secret-key-here}
  PORT: 3001
  NODE_ENV: production
```

- `DATABASE_URL`: 数据库连接字符串（容器内使用服务名 `postgres`）
- `JWT_SECRET`: JWT 签名密钥（必须在生产环境设置）
- `PORT`: 后端服务端口
- `NODE_ENV`: 运行环境

### Frontend 环境变量

在构建时使用 `frontend/.env.production`：

```
VITE_API_URL=/api
```

使用相对路径 `/api`，因为 Nginx 已配置代理。

## 数据持久化

数据库数据存储在 Docker 卷 `postgres_data` 中，即使容器删除数据也会保留。

查看卷：
```bash
docker volume ls | grep postgres_data
```

备份数据库：
```bash
docker exec oddslab-postgres pg_dump -U postgres oddslab > backup.sql
```

恢复数据库：
```bash
cat backup.sql | docker exec -i oddslab-postgres psql -U postgres oddslab
```

## 故障排查

### 容器无法启动

1. 查看日志：`docker logs oddslab-backend`
2. 检查端口占用：`lsof -i :80` 或 `lsof -i :3001`
3. 检查环境变量是否正确设置

### 数据库连接失败

1. 确保 PostgreSQL 容器健康：`docker ps`
2. 检查 DATABASE_URL 是否正确
3. 查看数据库日志：`docker logs oddslab-postgres`

### 前端无法访问 API

1. 检查 nginx 配置是否正确
2. 确认后端容器正在运行
3. 检查 Docker 网络：`docker network inspect backend_oddslab-network`

### 构建失败

1. 确保 `pnpm-lock.yaml` 文件存在
2. 检查 Docker 构建日志
3. 尝试清理并重新构建：
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

## 安全建议

1. **修改默认密码**: 更改 PostgreSQL 默认密码
2. **设置强 JWT_SECRET**: 使用随机生成的强密钥
3. **启用 HTTPS**: 生产环境必须使用 SSL
4. **防火墙配置**: 只开放必要端口（80, 443）
5. **定期备份**: 设置数据库自动备份
6. **更新依赖**: 定期更新 Docker 镜像和应用依赖

## 监控和日志

建议配置：
- 日志聚合工具（如 ELK Stack, Loki）
- 监控工具（如 Prometheus + Grafana）
- 容器健康检查和自动重启策略

## 性能优化

1. **使用 CDN**: 静态资源使用 CDN 加速
2. **数据库优化**: 根据负载调整 PostgreSQL 配置
3. **Nginx 缓存**: 配置静态资源缓存
4. **横向扩展**: 使用负载均衡运行多个后端实例
