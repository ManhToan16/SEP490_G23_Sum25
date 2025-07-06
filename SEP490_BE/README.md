# 🏥 Khanh An Neurology Clinic Management System

## 📋 Tổng quan dự án

**SEP490_BE** là hệ thống quản lý phòng khám thần kinh Khánh An được phát triển bởi nhóm **SEP490_G23_Sum25**.

### 🎯 Mục tiêu
Xây dựng hệ thống quản lý toàn diện cho phòng khám thần kinh, hỗ trợ:
- Quản lý bệnh nhân và lịch hên
- Quản lý bác sĩ và lịch trực
- Quản lý phòng khám và thiết bị
- Quản lý kết quả xét nghiệm
- Hệ thống xếp hàng thông minh

## 🛠️ Công nghệ sử dụng

### Backend (.NET 6.0)
- **Framework**: ASP.NET Core 6.0 Web API
- **Database**: SQL Server với Entity Framework Core 6.0
- **Authentication**: JWT Bearer + BCrypt password hashing
- **Caching**: Redis (StackExchange.Redis)
- **Documentation**: Swagger/OpenAPI
- **Mapping**: AutoMapper
- **Security**: CORS, Security Headers

### Dependencies chính
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="6.0.36" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="6.0.36" />
<PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="6.1.1" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="StackExchange.Redis" Version="2.8.41" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
```

## 🏗️ Kiến trúc dự án

```
SEP490_BE/
├── Controllers/              # API Controllers
│   ├── AuthController.cs     # Authentication endpoints
│   ├── UserController.cs     # User management
│   ├── DoctorProfilesController.cs
│   ├── DoctorSchedulesController.cs
│   └── ExaminationRoomsController.cs
├── Entities/                 # Database Entities & DbContext
│   ├── KhanhAnNeurologyClinicContext.cs
│   ├── User.cs
│   ├── DoctorProfile.cs
│   ├── Appointment.cs
│   └── ... (20+ entities)
├── Services/                 # Business Logic Services
│   ├── AuthServices/
│   ├── UserServices/
│   ├── DoctorServices/
│   └── EmailServices/
├── DTO/                      # Data Transfer Objects
├── Repositories/             # Repository Pattern
├── Middleware/               # Custom Middleware
├── Exceptions/               # Custom Exceptions
├── Constants/                # Application Constants
├── Utils/                    # Utility Classes
├── Templates/                # Email Templates
│   ├── reset-password-form.html
│   ├── reset-password-success.html
│   └── reset-password-email.html
└── Config/                   # Configuration Classes
```

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống
- **.NET 6.0 SDK**
- **SQL Server** (Local hoặc Docker)
- **Redis** (Tùy chọn)
- **Docker & Docker Compose** (Khuyến nghị)

### 🐳 Chạy với Docker (Khuyến nghị)

1. **Build và chạy:**
```bash
# Build image
docker build -t quanghd/be:latest .

# Hoặc sử dụng script
./build.sh          # Linux/Mac
.\build.ps1          # Windows

# Chạy với docker-compose
docker-compose up -d
```

2. **Kiểm tra ứng dụng:**
- **API Base**: http://localhost:5050
- **Swagger UI**: http://localhost:5050/swagger
- **Health Check**: http://localhost:5050/health

### 💻 Chạy trực tiếp

1. **Cài đặt dependencies:**
```bash
dotnet restore
```

2. **Cấu hình database:**
```bash
# Cập nhật connection string trong appsettings.json
# Chạy migrations (nếu có)
dotnet ef database update
```

3. **Chạy ứng dụng:**
```bash
dotnet run
# Hoặc
dotnet run --urls "http://localhost:5050"
```

## 📊 Database Schema

### Entities chính:
- **Users**: Quản lý user accounts và roles
- **DoctorProfiles**: Thông tin bác sĩ
- **PatientProfiles**: Thông tin bệnh nhân  
- **Appointments**: Lịch hẹn khám
- **DoctorSchedules**: Lịch trực của bác sĩ
- **ExaminationRooms**: Phòng khám
- **MedicalRecords**: Hồ sơ bệnh án
- **Prescriptions**: Đơn thuốc
- **LaboratoryResults**: Kết quả xét nghiệm
- **Queues**: Hệ thống xếp hàng

## 🔧 Cấu hình

### Environment Variables
```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:5050
ConnectionStrings__DefaultConnection=Server=localhost;Database=KhanhAnNeurologyClinic;User Id=sa;Password=123;
JwtSettings__SecretKey=your-super-secret-key-minimum-32-characters
JwtSettings__Issuer=SEP490_BE
JwtSettings__Audience=SEP490_FE
```

### Ports
- **API**: 5050 (cố định theo launchSettings.json)
- **Database**: 1433 (SQL Server)
- **Redis**: 6379 (nếu sử dụng)

## 🔐 API Authentication

### JWT Token Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

### Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 86400
  }
}
```

## 📚 API Documentation

### Main Endpoints:
- **Authentication**: `/api/auth/*`
- **Users**: `/api/user/*`
- **Doctors**: `/api/doctorprofiles/*`
- **Schedules**: `/api/doctorschedules/*`
- **Rooms**: `/api/examinationrooms/*`

### Swagger UI
Truy cập **http://localhost:5050/swagger** để xem API documentation đầy đủ.

## 🏥 Tính năng chính

### 👨‍⚕️ Quản lý Bác sĩ
- Đăng ký/quản lý thông tin bác sĩ
- Quản lý lịch trực và ca làm việc
- Phân công phòng khám

### 👤 Quản lý Bệnh nhân  
- Đăng ký hồ sơ bệnh nhân
- Đặt lịch hẹn khám
- Theo dõi lịch sử khám bệnh

### 🏢 Quản lý Phòng khám
- Quản lý phòng khám và thiết bị
- Phòng xét nghiệm
- Hệ thống xếp hàng thông minh

### 📋 Quản lý Hồ sơ
- Hồ sơ bệnh án điện tử
- Đơn thuốc điện tử
- Kết quả xét nghiệm

## 🔍 Health Check & Monitoring

### Health Check Endpoint: `/health`
```json
{
  "status": "Healthy",
  "totalDuration": 45.2,
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": [
    {
      "name": "database",
      "status": "Healthy", 
      "duration": 23.1,
      "description": "Entity Framework Core DbContext for KhanhAnNeurologyClinicContext"
    }
  ]
}
```

## 📦 Docker Support

### Dockerfile Features:
- ✅ Multi-stage build tối ưu
- ✅ Non-root user security
- ✅ Port 5050 cố định
- ✅ Health check tự động
- ✅ Templates directory support
- ✅ Timezone Asia/Ho_Chi_Minh

### Docker Compose:
- API Service (port 5050)
- SQL Server Database (port 1433)
- Volume persistence
- Network isolation

## 👥 Team Development

### Nhóm SEP490_G23_Sum25
- **Project**: SEP490 - Capstone Project
- **Semester**: Summer 2025
- **Domain**: Healthcare Management System

### Contributing
1. Fork repository
2. Create feature branch
3. Commit changes  
4. Push to branch
5. Create Pull Request

## 📞 Support

### Contacts:
- **Team**: SEP490_G23_Sum25
- **Project**: Khanh An Neurology Clinic
- **Documentation**: `/docs` folder

### Troubleshooting:
1. Kiểm tra logs: `docker logs sep490-api`
2. Health check: `curl http://localhost:5050/health`
3. Database connection
4. Port conflicts

---

**© 2024 SEP490_G23_Sum25 - Khanh An Neurology Clinic Management System** 