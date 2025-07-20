#!/bin/bash

# ===================================================================
# CLINIC MANAGEMENT SYSTEM - SIMPLE DEPLOYMENT SCRIPT
# ===================================================================
# Description: Simple deployment for Frontend & Backend only
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
FE_IMAGE="quanghd/fe:latest"
BE_IMAGE="quanghd/be:latest"
FE_CONTAINER="clinic-frontend"
BE_CONTAINER="clinic-backend"

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check Docker
check_docker() {
    log "🔍 Checking Docker..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running"
        exit 1
    fi
    
    success "Docker is ready"
}

# Pull latest images
pull_images() {
    log "🐳 Pulling latest images..."
    
    docker pull "$FE_IMAGE" || {
        error "Failed to pull Frontend image"
        exit 1
    }
    
    docker pull "$BE_IMAGE" || {
        error "Failed to pull Backend image"
        exit 1
    }
    
    success "Images pulled successfully"
}

# Deploy Frontend
deploy_frontend() {
    log "🎨 Deploying Frontend..."
    
    # Stop existing container
    if docker ps -a | grep -q "$FE_CONTAINER"; then
        log "Stopping existing Frontend container..."
        docker stop "$FE_CONTAINER" || true
        docker rm "$FE_CONTAINER" || true
    fi
    
    # Start new container
    docker run -d \
        --name "$FE_CONTAINER" \
        --restart unless-stopped \
        -p 3000:80 \
        -e NODE_ENV=production \
        -e REACT_APP_API_URL=http://localhost:5050 \
        "$FE_IMAGE" || {
        error "Failed to start Frontend container"
        exit 1
    }
    
    success "Frontend deployed successfully"
}

# Deploy Backend
deploy_backend() {
    log "🔧 Deploying Backend..."
    
    # Stop existing container
    if docker ps -a | grep -q "$BE_CONTAINER"; then
        log "Stopping existing Backend container..."
        docker stop "$BE_CONTAINER" || true
        docker rm "$BE_CONTAINER" || true
    fi
    
    # Start new container
    docker run -d \
        --name "$BE_CONTAINER" \
        --restart unless-stopped \
        -p 5050:5050 \
        -e ASPNETCORE_ENVIRONMENT=Production \
        -e ASPNETCORE_URLS=http://+:5050 \
        -e TZ=Asia/Ho_Chi_Minh \
        "$BE_IMAGE" || {
        error "Failed to start Backend container"
        exit 1
    }
    
    success "Backend deployed successfully"
}

# Health check
health_check() {
    log "🏥 Performing health checks..."
    
    # Wait for containers to start
    sleep 30
    
    # Check Frontend
    log "Checking Frontend health..."
    for i in {1..5}; do
        if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
            success "Frontend is healthy"
            break
        else
            warning "Frontend check attempt $i/5..."
            sleep 10
        fi
    done
    
    # Check Backend
    log "Checking Backend health..."
    for i in {1..5}; do
        if curl -f -s http://localhost:5050/health > /dev/null 2>&1; then
            success "Backend is healthy"
            break
        else
            warning "Backend check attempt $i/5..."
            sleep 10
        fi
    done
}

# Show status
show_status() {
    log "📊 Deployment Status"
    echo "=================================="
    echo "🏥 Clinic Management System"
    echo "🎨 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:5050"
    echo "=================================="
    
    # Show container status
    log "📋 Container Status:"
    docker ps --filter "name=clinic-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Show recent logs
    log "📜 Recent Logs:"
    echo "Frontend logs:"
    docker logs --tail=5 "$FE_CONTAINER" 2>/dev/null || echo "No logs available"
    echo ""
    echo "Backend logs:"
    docker logs --tail=5 "$BE_CONTAINER" 2>/dev/null || echo "No logs available"
}

# Cleanup old images
cleanup() {
    log "🧹 Cleaning up old images..."
    docker image prune -f
    success "Cleanup completed"
}

# Main deployment function
deploy() {
    log "🚀 Starting deployment..."
    
    check_docker
    pull_images
    deploy_frontend
    deploy_backend
    health_check
    show_status
    cleanup
    
    success "🎉 Deployment completed successfully!"
}

# Rollback function
rollback() {
    log "🔄 Rolling back to previous images..."
    
    # Stop current containers
    docker stop "$FE_CONTAINER" "$BE_CONTAINER" || true
    docker rm "$FE_CONTAINER" "$BE_CONTAINER" || true
    
    # Start with previous images (this is basic rollback)
    deploy_frontend
    deploy_backend
    health_check
    
    success "Rollback completed"
}

# Stop services
stop() {
    log "⏹️ Stopping services..."
    docker stop "$FE_CONTAINER" "$BE_CONTAINER" || true
    success "Services stopped"
}

# Start services
start() {
    log "▶️ Starting services..."
    docker start "$FE_CONTAINER" "$BE_CONTAINER" || true
    success "Services started"
}

# Restart services
restart() {
    log "🔄 Restarting services..."
    docker restart "$FE_CONTAINER" "$BE_CONTAINER" || true
    success "Services restarted"
}

# Show logs
logs() {
    case "${2:-all}" in
        "frontend"|"fe")
            docker logs -f "$FE_CONTAINER"
            ;;
        "backend"|"be")
            docker logs -f "$BE_CONTAINER"
            ;;
        *)
            echo "Frontend logs:"
            docker logs --tail=20 "$FE_CONTAINER"
            echo ""
            echo "Backend logs:"
            docker logs --tail=20 "$BE_CONTAINER"
            ;;
    esac
}

# Main execution
main() {
    case "${1:-deploy}" in
        "deploy")
            deploy
            ;;
        "rollback")
            rollback
            ;;
        "stop")
            stop
            ;;
        "start")
            start
            ;;
        "restart")
            restart
            ;;
        "status")
            show_status
            ;;
        "logs")
            logs "$@"
            ;;
        "health")
            health_check
            ;;
        "clean")
            log "🧹 Cleaning up containers and images..."
            docker stop "$FE_CONTAINER" "$BE_CONTAINER" || true
            docker rm "$FE_CONTAINER" "$BE_CONTAINER" || true
            docker system prune -f
            success "Cleanup completed"
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|start|stop|restart|status|logs|health|clean}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Deploy Frontend & Backend"
            echo "  rollback - Rollback to previous version"
            echo "  start    - Start containers"
            echo "  stop     - Stop containers"
            echo "  restart  - Restart containers"
            echo "  status   - Show deployment status"
            echo "  logs     - Show logs [frontend|backend|all]"
            echo "  health   - Check service health"
            echo "  clean    - Clean up containers and images"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@" 