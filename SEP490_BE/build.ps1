# build.ps1
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Building SEP490_BE Docker Image        " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Build image
Write-Host "Building Docker image với tag quanghd/be:latest..." -ForegroundColor Yellow
docker build -t quanghd/be:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build thành công!" -ForegroundColor Green
    Write-Host "Image: quanghd/be:latest" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Để chạy container:" -ForegroundColor Yellow
    Write-Host "docker run -d --name sep490-api -p 5050:5050 quanghd/be:latest" -ForegroundColor White
    Write-Host ""
    Write-Host "Hoặc sử dụng docker-compose:" -ForegroundColor Yellow
    Write-Host "docker-compose up -d" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 API Endpoints:" -ForegroundColor Green
    Write-Host "   API Base: http://localhost:5050" -ForegroundColor Cyan
    Write-Host "   Weather: http://localhost:5050/weatherforecast" -ForegroundColor Cyan
    Write-Host "   Auth: http://localhost:5050/api/auth" -ForegroundColor Cyan
    Write-Host "   Swagger UI: http://localhost:5050/swagger" -ForegroundColor Cyan
    Write-Host "   Health Check: http://localhost:5050/health" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build thất bại!" -ForegroundColor Red
    exit 1
} 