#!/bin/bash

echo "=========================================="
echo "  Building SEP490_BE Docker Image        "
echo "=========================================="

# Build image
echo "Building Docker image với tag quanghd/be:latest..."
docker build -t quanghd/be:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build thành công!"
    echo "Image: quanghd/be:latest"
    
    echo ""
    echo "Để chạy container:"
    echo "docker run -d --name sep490-api -p 5050:5050 quanghd/be:latest"
    echo ""
    echo "Hoặc sử dụng docker-compose:"
    echo "docker-compose up -d"
    echo ""
    echo "🌐 API Endpoints:"
    echo "   API Base: http://localhost:5050"
    echo "   Weather: http://localhost:5050/weatherforecast"
    echo "   Auth: http://localhost:5050/api/auth"
    echo "   Swagger UI: http://localhost:5050/swagger"
    echo "   Health Check: http://localhost:5050/health"
else
    echo "❌ Build thất bại!"
    exit 1
fi 