# 🚀 Deployment Guide - Clinic Management System

## Overview

This guide provides step-by-step instructions for deploying the Clinic Management System on an Ubuntu server using Docker and Nginx.

## 📋 Prerequisites

- Ubuntu Server 20.04 LTS or 22.04 LTS
- SSH access to the server
- Domain name (optional but recommended for SSL)
- Basic knowledge of Linux commands

## 🛠️ Server Requirements

### Minimum Requirements

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Network**: 1Gbps connection

### Recommended Production Requirements

- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 1Gbps connection
- **Backup**: Automated daily backups

## 🔧 Installation Steps

### Step 1: Initial Server Setup

1. **Connect to your server**:

   ```bash
   ssh root@your-server-ip
   ```

2. **Run the server setup script**:

   ```bash
   wget https://raw.githubusercontent.com/your-repo/clinic-app/main/scripts/server-setup.sh
   chmod +x server-setup.sh
   ./server-setup.sh
   ```

3. **Add your SSH public key** (replace with your actual public key):

   ```bash
   echo "your-ssh-public-key" >> /home/clinic/.ssh/authorized_keys
   chmod 600 /home/clinic/.ssh/authorized_keys
   chown -R clinic:clinic /home/clinic/.ssh
   ```

4. **Switch to clinic user**:
   ```bash
   su - clinic
   ```

### Step 2: Install Docker

1. **Run the Docker installation script**:

   ```bash
   cd /opt/clinic-app
   wget https://raw.githubusercontent.com/your-repo/clinic-app/main/scripts/install-docker.sh
   chmod +x install-docker.sh
   ./install-docker.sh
   ```

2. **Log out and log back in** to apply Docker group membership:

   ```bash
   exit
   ssh clinic@your-server-ip
   ```

3. **Verify Docker installation**:
   ```bash
   docker --version
   docker-compose --version
   ```

### Step 3: Clone and Setup Application

1. **Clone the repository**:

   ```bash
   cd /opt/clinic-app
   git clone https://github.com/your-repo/clinic-app.git .
   ```

2. **Copy environment files**:

   ```bash
   cp .env.example .env.production
   ```

3. **Edit environment variables**:

   ```bash
   nano .env.production
   ```

   Update the following variables:

   ```env
   VITE_API_URL=https://your-domain.com
   VITE_APP_NAME=Your Clinic Name
   # Add other required variables
   ```

### Step 4: SSL Certificate Setup (Optional but Recommended)

1. **Update domain in SSL script**:

   ```bash
   nano scripts/setup-ssl.sh
   # Change clinic.example.com to your actual domain
   ```

2. **Run SSL setup**:
   ```bash
   chmod +x scripts/setup-ssl.sh
   ./scripts/setup-ssl.sh
   ```

### Step 5: Deploy Application

1. **Make deploy script executable**:

   ```bash
   chmod +x scripts/deploy.sh
   ```

2. **Run initial deployment**:

   ```bash
   ./scripts/deploy.sh deploy
   ```

3. **Verify deployment**:
   ```bash
   curl http://localhost/health
   # Should return "healthy"
   ```

## 🔍 Verification

### Check Running Containers

```bash
docker ps
```

You should see containers for:

- `clinic-frontend`
- `clinic-nginx`

### Check Application Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Test Application

```bash
# Test health endpoint
curl http://localhost/health

# Test main application (if SSL is setup)
curl https://your-domain.com
```

## 📊 Monitoring and Maintenance

### Setup Automated Backups

1. **Make backup script executable**:

   ```bash
   chmod +x scripts/backup.sh
   ```

2. **Test backup script**:

   ```bash
   ./scripts/backup.sh
   ```

3. **Setup automated backups with cron**:
   ```bash
   crontab -e
   # Add this line for daily backups at 2 AM:
   0 2 * * * /opt/clinic-app/scripts/backup.sh
   ```

### Log Monitoring

- **Application logs**: `/opt/clinic-app/logs/`
- **System logs**: `/var/log/clinic/`
- **Nginx logs**: `/var/log/nginx/`

### Health Monitoring

Create a simple monitoring script:

```bash
#!/bin/bash
# monitor.sh
curl -f http://localhost/health || echo "Application is down!" | mail -s "Alert: Clinic App Down" admin@yourdomain.com
```

Setup cron job for health monitoring:

```bash
# Check every 5 minutes
*/5 * * * * /opt/clinic-app/scripts/monitor.sh
```

## 🔄 Updates and Maintenance

### Deploying Updates

1. **Pull latest changes**:

   ```bash
   cd /opt/clinic-app
   git pull origin main
   ```

2. **Deploy updates**:
   ```bash
   ./scripts/deploy.sh deploy
   ```

### Rolling Back

If something goes wrong:

```bash
./scripts/deploy.sh rollback
```

### Manual Container Management

```bash
# Stop all containers
docker-compose -f docker-compose.prod.yml down

# Start all containers
docker-compose -f docker-compose.prod.yml up -d

# Restart specific service
docker-compose -f docker-compose.prod.yml restart nginx

# View logs
docker-compose -f docker-compose.prod.yml logs -f frontend
```

## 🛡️ Security Considerations

### Firewall Status

```bash
sudo ufw status
```

### SSL Certificate Renewal

SSL certificates auto-renew. Check status:

```bash
sudo certbot certificates
```

### System Updates

```bash
sudo apt update && sudo apt upgrade -y
```

### Docker Security

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Check for security updates
docker scout cves
```

## 🚨 Troubleshooting

### Common Issues

1. **Container won't start**:

   ```bash
   docker-compose -f docker-compose.prod.yml logs container-name
   ```

2. **Permission denied errors**:

   ```bash
   sudo chown -R clinic:clinic /opt/clinic-app
   ```

3. **SSL certificate issues**:

   ```bash
   sudo certbot renew --dry-run
   ```

4. **Port already in use**:
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

### Emergency Procedures

1. **Complete application restart**:

   ```bash
   cd /opt/clinic-app
   docker-compose -f docker-compose.prod.yml down
   docker system prune -f
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Restore from backup**:
   ```bash
   cd /opt/clinic-app/backups
   # List available backups
   ls -la
   # Restore specific backup
   tar -xzf clinic-backup-YYYYMMDD-HHMMSS/app-files.tar.gz -C /opt/clinic-app/
   ```

## 📞 Support

For issues and support:

- Check logs first: `docker-compose logs -f`
- Review this documentation
- Contact system administrator

## 📝 File Structure

```
/opt/clinic-app/
├── docker-compose.prod.yml     # Production Docker Compose
├── nginx.prod.conf             # Nginx configuration
├── .env.production            # Environment variables
├── ssl/                       # SSL certificates
├── logs/                      # Application logs
├── backups/                   # Backup files
└── scripts/                   # Deployment scripts
    ├── deploy.sh              # Main deployment script
    ├── backup.sh              # Backup script
    ├── setup-ssl.sh           # SSL setup script
    ├── install-docker.sh      # Docker installation
    └── server-setup.sh        # Initial server setup
```

---

**Last Updated**: $(date)
**Version**: 1.0.0
