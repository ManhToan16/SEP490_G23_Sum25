#!/bin/bash

# ===================================================================
# CLINIC MANAGEMENT SYSTEM - BACKUP SCRIPT
# ===================================================================
# Description: Automated backup script for Clinic Management System
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
BACKUP_DIR="/opt/clinic-backups"
LOG_FILE="/var/log/clinic-backup.log"
RETENTION_DAYS=7
DB_PASSWORD=${DB_PASSWORD:-"YourStrong@Passw0rd123"}
COMPOSE_FILE="docker-compose.yml"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

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

# Check if containers are running
check_containers() {
    log "🔍 Checking container status..."
    
    if ! docker ps | grep -q "clinic-database"; then
        error "Database container is not running"
        return 1
    fi
    
    success "Database container is running"
}

# Backup database
backup_database() {
    log "🗄️ Backing up database..."
    
    BACKUP_NAME="clinic-db-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Create database backup
    docker exec clinic-database /opt/mssql-tools/bin/sqlcmd \
        -S localhost -U sa -P "$DB_PASSWORD" \
        -Q "BACKUP DATABASE ClinicDB TO DISK = '/tmp/clinicdb.bak' WITH FORMAT, INIT;" || {
        error "Database backup failed"
        return 1
    }
    
    # Copy backup file to host
    docker cp clinic-database:/tmp/clinicdb.bak "$BACKUP_PATH.bak" || {
        error "Failed to copy backup file"
        return 1
    }
    
    # Compress backup
    gzip "$BACKUP_PATH.bak"
    
    success "Database backup completed: $BACKUP_NAME.bak.gz"
}

# Backup configuration files
backup_configs() {
    log "📁 Backing up configuration files..."
    
    CONFIG_BACKUP_NAME="clinic-config-$(date +%Y%m%d-%H%M%S)"
    CONFIG_BACKUP_PATH="$BACKUP_DIR/$CONFIG_BACKUP_NAME"
    
    # Create config backup directory
    mkdir -p "$CONFIG_BACKUP_PATH"
    
    # Copy important files
    cp docker-compose.yml "$CONFIG_BACKUP_PATH/"
    cp .env.production "$CONFIG_BACKUP_PATH/" 2>/dev/null || true
    cp -r nginx "$CONFIG_BACKUP_PATH/" 2>/dev/null || true
    cp -r scripts "$CONFIG_BACKUP_PATH/" 2>/dev/null || true
    
    # Compress config backup
    tar -czf "$CONFIG_BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "$CONFIG_BACKUP_NAME"
    rm -rf "$CONFIG_BACKUP_PATH"
    
    success "Configuration backup completed: $CONFIG_BACKUP_NAME.tar.gz"
}

# Backup Docker volumes
backup_volumes() {
    log "🐳 Backing up Docker volumes..."
    
    VOLUME_BACKUP_NAME="clinic-volumes-$(date +%Y%m%d-%H%M%S)"
    VOLUME_BACKUP_PATH="$BACKUP_DIR/$VOLUME_BACKUP_NAME"
    
    # Create volume backup
    docker run --rm \
        -v clinic_db_data:/data \
        -v "$BACKUP_DIR":/backup \
        ubuntu tar -czf "/backup/$VOLUME_BACKUP_NAME.tar.gz" -C /data . || {
        warning "Volume backup failed or no volumes to backup"
        return 0
    }
    
    success "Volume backup completed: $VOLUME_BACKUP_NAME.tar.gz"
}

# Backup application logs
backup_logs() {
    log "📜 Backing up application logs..."
    
    LOG_BACKUP_NAME="clinic-logs-$(date +%Y%m%d-%H%M%S)"
    LOG_BACKUP_PATH="$BACKUP_DIR/$LOG_BACKUP_NAME"
    
    # Create log backup directory
    mkdir -p "$LOG_BACKUP_PATH"
    
    # Copy container logs
    docker logs clinic-frontend > "$LOG_BACKUP_PATH/frontend.log" 2>&1 || true
    docker logs clinic-backend > "$LOG_BACKUP_PATH/backend.log" 2>&1 || true
    docker logs clinic-database > "$LOG_BACKUP_PATH/database.log" 2>&1 || true
    
    # Copy system logs
    cp /var/log/clinic-deploy.log "$LOG_BACKUP_PATH/" 2>/dev/null || true
    cp /var/log/clinic-backup.log "$LOG_BACKUP_PATH/" 2>/dev/null || true
    
    # Compress log backup
    tar -czf "$LOG_BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "$LOG_BACKUP_NAME"
    rm -rf "$LOG_BACKUP_PATH"
    
    success "Log backup completed: $LOG_BACKUP_NAME.tar.gz"
}

# Clean up old backups
cleanup_old_backups() {
    log "🧹 Cleaning up old backups..."
    
    # Remove backups older than retention period
    find "$BACKUP_DIR" -name "clinic-*" -type f -mtime +$RETENTION_DAYS -delete
    
    # Count remaining backups
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/clinic-* 2>/dev/null | wc -l)
    
    success "Cleanup completed. $BACKUP_COUNT backups remaining."
}

# Generate backup report
generate_report() {
    log "📊 Generating backup report..."
    
    REPORT_FILE="$BACKUP_DIR/backup-report-$(date +%Y%m%d).txt"
    
    cat > "$REPORT_FILE" << EOF
# ===================================================================
# CLINIC BACKUP REPORT
# ===================================================================
Date: $(date)
Backup Directory: $BACKUP_DIR
Retention Period: $RETENTION_DAYS days

# Recent Backups
$(ls -lah "$BACKUP_DIR"/clinic-* 2>/dev/null | head -20)

# Disk Usage
$(df -h "$BACKUP_DIR")

# Database Status
$(docker exec clinic-database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -Q "SELECT name, create_date, state_desc FROM sys.databases WHERE name = 'ClinicDB';" 2>/dev/null || echo "Database check failed")

# Container Status
$(docker ps --filter "name=clinic-" --format "table {{.Names}}\t{{.Status}}\t{{.Size}}")

# System Resources
Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')
Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')
Load: $(uptime | awk -F'load average:' '{print $2}')

# ===================================================================
EOF

    success "Backup report generated: $REPORT_FILE"
}

# Send backup notification
send_notification() {
    log "📧 Sending backup notification..."
    
    # Send email notification (if configured)
    if [ -n "${NOTIFICATION_EMAIL:-}" ]; then
        {
            echo "Subject: Clinic Backup Report - $(date +%Y-%m-%d)"
            echo "To: $NOTIFICATION_EMAIL"
            echo ""
            echo "Clinic Management System Backup Report"
            echo "======================================"
            echo ""
            echo "Backup Date: $(date)"
            echo "Status: Success"
            echo "Backup Directory: $BACKUP_DIR"
            echo ""
            echo "Recent Backups:"
            ls -lah "$BACKUP_DIR"/clinic-* 2>/dev/null | head -10
            echo ""
            echo "System Status:"
            echo "- Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
            echo "- Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"
            echo "- Containers: $(docker ps --filter "name=clinic-" --format "{{.Names}}" | wc -l) running"
            echo ""
            echo "This is an automated backup report."
        } | sendmail "$NOTIFICATION_EMAIL" 2>/dev/null || warning "Email notification failed"
    fi
}

# Main backup function
main() {
    log "🚀 Starting backup process..."
    
    # Check prerequisites
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    # Check disk space
    AVAILABLE_SPACE=$(df "$BACKUP_DIR" | tail -1 | awk '{print $4}')
    if [ "$AVAILABLE_SPACE" -lt 1048576 ]; then  # Less than 1GB
        warning "Low disk space: ${AVAILABLE_SPACE}KB available"
    fi
    
    # Perform backups
    if check_containers; then
        backup_database
        backup_configs
        backup_volumes
        backup_logs
        cleanup_old_backups
        generate_report
        send_notification
        
        success "🎉 Backup process completed successfully!"
    else
        error "Backup failed: Container check failed"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "database")
        check_containers && backup_database
        ;;
    "configs")
        backup_configs
        ;;
    "volumes")
        backup_volumes
        ;;
    "logs")
        backup_logs
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "report")
        generate_report
        ;;
    "full"|"")
        main
        ;;
    *)
        echo "Usage: $0 [database|configs|volumes|logs|cleanup|report|full]"
        echo ""
        echo "Commands:"
        echo "  database - Backup database only"
        echo "  configs  - Backup configuration files"
        echo "  volumes  - Backup Docker volumes"
        echo "  logs     - Backup application logs"
        echo "  cleanup  - Clean up old backups"
        echo "  report   - Generate backup report"
        echo "  full     - Full backup (default)"
        exit 1
        ;;
esac 