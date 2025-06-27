#!/bin/bash

# Clinic Frontend Deployment Script
# Đơn giản với nginx

set -e

echo "🚀 Starting Clinic Frontend Deployment..."
echo "==============================================="

# Variables
IMAGE_NAME="quanghd/fe:latest"
CONTAINER_NAME="clinic-frontend"
PORT="3000"

# Functions
cleanup() {
    echo "🧹 Cleaning up old container..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

build_image() {
    echo "🔨 Building Docker image..."
    docker build -t $IMAGE_NAME .
    echo "✅ Image built successfully"
}

run_container() {
    echo "🚀 Starting new container..."
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $PORT:80 \
        $IMAGE_NAME
    echo "✅ Container started successfully"
}

check_health() {
    echo "⏳ Waiting for application to start..."
    sleep 5
    
    if curl -sf http://localhost:$PORT > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        return 0
    else
        echo "❌ Health check failed"
        return 1
    fi
}

show_info() {
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "==============================================="
    echo "📦 Container: $CONTAINER_NAME"
    echo "🌐 Local URL: http://localhost:$PORT"
    echo "🔧 Configure in Nginx Proxy Manager:"
    echo "   - Forward to: localhost:$PORT"
    echo "   - Enable SSL with Let's Encrypt"
    echo ""
    echo "📊 Container Status:"
    docker ps | grep $CONTAINER_NAME
    echo ""
}

# Main execution
main() {
    echo "🔍 Checking prerequisites..."
    
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running"
        exit 1
    fi
    
    cleanup
    build_image
    run_container
    
    if check_health; then
        show_info
    else
        echo "❌ Deployment failed!"
        docker logs $CONTAINER_NAME
        exit 1
    fi
}

# Parse arguments
case "${1:-}" in
    "logs")
        docker logs -f $CONTAINER_NAME
        exit 0
        ;;
    "restart")
        echo "🔄 Restarting..."
        docker restart $CONTAINER_NAME
        exit 0
        ;;
    "stop")
        echo "⏹️ Stopping..."
        docker stop $CONTAINER_NAME
        exit 0
        ;;
esac

# Run main function
main 