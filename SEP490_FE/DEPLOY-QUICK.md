# 🚀 Quick Deploy Guide

## Deploy Nhanh Trong 3 Bước

### 1. Build và Run
```bash
# Clone repo
git clone <your-repo>
cd SEP490_FE

# Deploy với script
chmod +x deploy.sh
./deploy.sh
```

### 2. Kiểm Tra
```bash
# Mở browser: http://localhost:8080
curl http://localhost:8080
```

### 3. Cấu Hình Nginx Proxy Manager
- **Domain**: `clinic.yourdomain.com`
- **Forward to**: `localhost:8080`
- **SSL**: Enable Let's Encrypt

## Commands Hữu Ích

```bash
# Xem logs
./deploy.sh logs

# Restart
./deploy.sh restart

# Stop
./deploy.sh stop

# Manual commands
docker build -t quanghd/fe:latest .
docker run -d --name clinic-frontend -p 8080:80 quanghd/fe:latest
```

## Dockerfile Đơn Giản
- ✅ Multi-stage build (Node + Nginx)
- ✅ Inline nginx config 
- ✅ SPA routing support
- ✅ Static file caching
- ✅ Image size ~50MB

## Troubleshoot
```bash
# Check container
docker ps
docker logs clinic-frontend

# Check port
netstat -tulpn | grep 8080

# Clean up
docker stop clinic-frontend
docker rm clinic-frontend
docker system prune -f
```

**Done!** 🎉 App running at http://localhost:8080 