#!/bin/bash

# ===================================================================
# CLINIC MANAGEMENT SYSTEM - PRODUCTION DEPLOYMENT SCRIPT
# ===================================================================
# Description: Automated deployment script for Clinic Management System
# Author: SEP490_G23_Sum25
# Version: 1.0.0
# ===================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"
BACKUP_DIR="/opt/clinic-backups"
LOG_FILE="/var/log/clinic-deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check environment file
    if [ ! -f "$ENV_FILE" ]; then
        warning "Environment file not found, using defaults"
        cp env-production.template "$ENV_FILE"
    fi
    
    success "Prerequisites check passed"
}

# Backup current deployment
backup_current() {
    log "💾 Creating backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Create backup with timestamp
    BACKUP_NAME="clinic-backup-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Backup database
    docker exec clinic-database /opt/mssql-tools/bin/sqlcmd \
        -S localhost -U sa -P "${DB_PASSWORD}" \
        -Q "BACKUP DATABASE ClinicDB TO DISK = '/tmp/clinicdb.bak'" || true
    
    # Copy backup file
    docker cp clinic-database:/tmp/clinicdb.bak "$BACKUP_PATH.bak" || true
    
    # Backup docker-compose and env files
    cp docker-compose.yml "$BACKUP_PATH-compose.yml"
    cp "$ENV_FILE" "$BACKUP_PATH.env"
    
    success "Backup created: $BACKUP_NAME"
}

# Pull latest images
pull_images() {
    log "🐳 Pulling latest Docker images..."
    
    docker-compose -f "$COMPOSE_FILE" pull
    
    success "Images pulled successfully"
}

# Deploy application
deploy() {
    log "🚀 Starting deployment..."
    
    # Stop existing containers
    log "⏹️ Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down || true
    
    # Start new containers
    log "🔄 Starting new containers..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    success "Containers started successfully"
}

# Health check
health_check() {
    log "🏥 Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check frontend
    if curl -f -s http://localhost:3000 > /dev/null; then
        success "Frontend is healthy"
    else
        error "Frontend health check failed"
        return 1
    fi
    
    # Check backend
    if curl -f -s http://localhost:5050/health > /dev/null; then
        success "Backend is healthy"
    else
        error "Backend health check failed"
        return 1
    fi
    
    # Check database
    if docker exec clinic-database /opt/mssql-tools/bin/sqlcmd \
        -S localhost -U sa -P "${DB_PASSWORD}" \
        -Q "SELECT 1" > /dev/null; then
        success "Database is healthy"
    else
        error "Database health check failed"
        return 1
    fi
    
    success "All services are healthy"
}

# Show deployment info
show_info() {
    log "📊 Deployment Information"
    echo "=================================="
    echo "🏥 Clinic Management System"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:5050"
    echo "🗄️ Database: localhost:1433"
    echo "🐳 Redis: localhost:6379"
    echo "=================================="
    
    # Show container status
    log "📋 Container Status:"
    docker ps --filter "name=clinic-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Show logs
    log "📜 Recent Logs:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=10
}

# Rollback function
rollback() {
    log "🔄 Rolling back deployment..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/clinic-backup-*.bak 2>/dev/null | head -1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        log "📥 Restoring from backup: $LATEST_BACKUP"
        
        # Stop current containers
        docker-compose -f "$COMPOSE_FILE" down || true
        
        # Restore database
        docker exec clinic-database /opt/mssql-tools/bin/sqlcmd \
            -S localhost -U sa -P "${DB_PASSWORD}" \
            -Q "RESTORE DATABASE ClinicDB FROM DISK = '/tmp/clinicdb.bak'" || true
        
        # Start containers
        docker-compose -f "$COMPOSE_FILE" up -d
        
        success "Rollback completed"
    else
        error "No backup found for rollback"
        exit 1
    fi
}

# Cleanup old backups
cleanup() {
    log "🧹 Cleaning up old backups..."
    
    # Remove backups older than 7 days
    find "$BACKUP_DIR" -name "clinic-backup-*" -mtime +7 -delete
    
    # Remove unused Docker images
    docker image prune -f
    
    success "Cleanup completed"
}

# Main execution
main() {
    case "${1:-deploy}" in
        "deploy")
            log "🚀 Starting full deployment process..."
            check_prerequisites
            backup_current
            pull_images
            deploy
            health_check
            show_info
            cleanup
            success "🎉 Deployment completed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        "health")
            health_check
            ;;
        "logs")
            docker-compose -f "$COMPOSE_FILE" logs -f
            ;;
        "status")
            show_info
            ;;
        "stop")
            log "⏹️ Stopping services..."
            docker-compose -f "$COMPOSE_FILE" down
            success "Services stopped"
            ;;
        "restart")
            log "🔄 Restarting services..."
            docker-compose -f "$COMPOSE_FILE" restart
            success "Services restarted"
            ;;
        "clean")
            log "🧹 Cleaning up..."
            docker-compose -f "$COMPOSE_FILE" down -v
            docker system prune -f
            success "Cleanup completed"
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health|logs|status|stop|restart|clean}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Full deployment process"
            echo "  rollback - Rollback to previous version"
            echo "  health   - Check service health"
            echo "  logs     - Show service logs"
            echo "  status   - Show deployment status"
            echo "  stop     - Stop all services"
            echo "  restart  - Restart all services"
            echo "  clean    - Clean up containers and images"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@" 