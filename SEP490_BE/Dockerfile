# ===================================================================
# DOCKERFILE CHO DỰ ÁN SEP490_BE - KHANH AN NEUROLOGY CLINIC
# ===================================================================
# Dự án: Hệ thống quản lý phòng khám thần kinh Khánh An
# Framework: .NET 6.0 Web API  
# Database: SQL Server với Entity Framework Core
# Features: JWT Auth, BCrypt, Redis Cache, CORS, Swagger, AutoMapper
# Port: 5050 (cố định theo launchSettings.json)
# ===================================================================

# Stage 1: Build Stage
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy project files để tận dụng Docker layer caching
COPY ["SEP490_BE.csproj", "./"]
COPY ["SEP490_BE.sln", "./"]

# Restore NuGet packages
RUN dotnet restore "SEP490_BE.csproj"

# Copy toàn bộ source code
COPY . .

# Build ứng dụng
RUN dotnet build "SEP490_BE.csproj" -c Release -o /app/build

# Publish ứng dụng
RUN dotnet publish "SEP490_BE.csproj" -c Release -o /app/publish --no-restore

# ===================================================================
# Stage 2: Runtime Stage
# ===================================================================
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app

# Cài đặt các tools cần thiết
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        wget \
        curl \
        net-tools && \
    rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=build /app/publish .

# Copy Templates directory
COPY Templates/ ./Templates/

# Tạo thư mục uploads trong container (sẽ được mount từ bên ngoài)
RUN mkdir -p /opt/khanhan/uploads

# Tạo thư mục logs
RUN mkdir -p /app/logs

# Tạo non-root user cho security
RUN addgroup --system --gid 1001 clinicuser && \
    adduser --system --uid 1001 --gid 1001 --shell /bin/false clinicuser

# Set permissions cho thư mục app
RUN chown -R clinicuser:clinicuser /app

# Switch to non-root user
USER clinicuser

# ===================================================================
# ENVIRONMENT VARIABLES
# ===================================================================
# Port 5050 cố định theo launchSettings.json
ENV ASPNETCORE_URLS=http://+:5050
ENV ASPNETCORE_ENVIRONMENT=Production
ENV TZ=Asia/Ho_Chi_Minh

# Database và JWT settings (sẽ override từ docker-compose)
ENV ConnectionStrings__DefaultConnection=""
ENV JwtSettings__SecretKey=""
ENV JwtSettings__Issuer="SEP490_BE"
ENV JwtSettings__Audience="SEP490_FE"

# ===================================================================
# NETWORKING
# ===================================================================
# Expose port 5050 - Port chính của Khanh An Clinic API
EXPOSE 5050

# ===================================================================
# HEALTH CHECK
# ===================================================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5050/health || exit 1

# ===================================================================
# METADATA
# ===================================================================
LABEL maintainer="SEP490_G23_Sum25"
LABEL version="1.0.0"
LABEL description="Khanh An Neurology Clinic Management System"
LABEL project="SEP490_BE"
LABEL port="5050"

# ===================================================================
# ENTRYPOINT
# ===================================================================
ENTRYPOINT ["dotnet", "SEP490_BE.dll"] 