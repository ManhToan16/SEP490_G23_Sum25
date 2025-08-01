using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SEP490_BE.Config;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Hubs;
using SEP490_BE.Middleware;
using SEP490_BE.Repositories.AppointmentRepositories;
using SEP490_BE.Repositories.AssignmentRepositories;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.CategoryRepositories;
using SEP490_BE.Repositories.DoctorProfileRepositories;
using SEP490_BE.Repositories.ExaminationResultRepositories;
using SEP490_BE.Repositories.ExaminationRoomRepositories;
using SEP490_BE.Repositories.LaboratoryResultRepositories;
using SEP490_BE.Repositories.LaboratoryRoomRepositories;
using SEP490_BE.Repositories.MaterialRepositories;
using SEP490_BE.Repositories.MedicalRecordRepositories;
using SEP490_BE.Repositories.MedicineRepositories;
using SEP490_BE.Repositories.PatientProfileRepositories;
using SEP490_BE.Repositories.PrescriptionRepositories;
using SEP490_BE.Repositories.RoleRepositories;
using SEP490_BE.Repositories.ScheduleChangeRepositories;
using SEP490_BE.Repositories.ScheduleRepositories;
using SEP490_BE.Repositories.ServiceRepositories;
using SEP490_BE.Repositories.SupplierRepositories;
using SEP490_BE.Repositories.TimeSlotRepositories;
using SEP490_BE.Repositories.TransactionRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Repositories.VisitRepositories;
using SEP490_BE.Services.AppointmentServices;
using SEP490_BE.Services.AssignmentServices;
using SEP490_BE.Services.AuditLogServices;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.CategoryServices;
using SEP490_BE.Services.DoctorProfileServices;
using SEP490_BE.Services.EmailServices;
using SEP490_BE.Services.ExaminationResultServices;
using SEP490_BE.Services.ExaminationRoomServices;
using SEP490_BE.Services.FileServices;
using SEP490_BE.Services.LaboratoryResultServices;
using SEP490_BE.Services.LaboratoryRoomServices;
using SEP490_BE.Services.MaterialServices;
using SEP490_BE.Services.MedicalRecordServices;
using SEP490_BE.Services.MedicineServices;
using SEP490_BE.Services.PatientProfileServices;
using SEP490_BE.Services.PrescriptionServices;
using SEP490_BE.Services.ScheduleChangeServices;
using SEP490_BE.Services.ScheduleServices;
using SEP490_BE.Services.ServiceServices;
using SEP490_BE.Services.SupplierServices;
using SEP490_BE.Services.TimeSlotServices;
using SEP490_BE.Services.TransactionServices;
using SEP490_BE.Services.UserServices;
using SEP490_BE.Services.VisitServices;
using StackExchange.Redis;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

#region Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://khanhanclinic.io.vn")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); 
    });
});

#endregion

builder.Services.AddControllers();
builder.Services.AddSignalR();
#region API Validation Config
builder.Services.Configure<ApiBehaviorOptions>(ValidationConfig.Configure);
#endregion

#region Redis
var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnectionString))
{
    builder.Services.AddSingleton<IConnectionMultiplexer>(
        ConnectionMultiplexer.Connect(redisConnectionString));
}
#endregion

#region Database SQL Server
builder.Services.AddDbContext<KhanhAnNeurologyClinicContext>(option => option.UseSqlServer
    (builder.Configuration.GetConnectionString("MyDB")));
#endregion

#region JWT
var secretKey = builder.Configuration["Jwt:SecretKey"];
var secretKeyBytes = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "",
            ValidAudience = "",
            IssuerSigningKey = new SymmetricSecurityKey(secretKeyBytes),
            ClockSkew = TimeSpan.Zero
        };

        opt.Events = new JwtBearerEvents
        {
            OnChallenge = context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";

                var response = JsonSerializer.Serialize(new ErrorResponse
                {
                    StatusCode = 401,
                    Message = MessageConstants.UNAUTHORIZED_ERROR
                });

                return context.Response.WriteAsync(response);
            },
            OnForbidden = context =>
            {
                context.Response.StatusCode = 403;
                context.Response.ContentType = "application/json";

                var response = JsonSerializer.Serialize(new ErrorResponse
                {
                    StatusCode = 403,
                    Message = MessageConstants.FORBIDDEN,

                });

                return context.Response.WriteAsync(response);
            }
        };
    });
#endregion

#region Hangfire
builder.Services.AddHangfire(config =>
    config.UseSqlServerStorage(builder.Configuration.GetConnectionString("MyDB")));
builder.Services.AddHangfireServer();
#endregion

QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;


builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(options =>
{
    options.TimestampFormat = "dd-MM-yyyy HH:mm:ss ";
    options.IncludeScopes = false;
});
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
#region Scope
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IDoctorProfileService, DoctorProfileService>();
builder.Services.AddScoped<IExaminationRoomService, ExaminationRoomService>();
builder.Services.AddScoped<ILaboratoryRoomService, LaboratoryRoomService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<IPatientProfileService, PatientProfileService>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IScheduleChangeService, ScheduleChangeRequestService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<ISupplierService, SupplierService>();
builder.Services.AddScoped<ITimeSlotService, TimeSlotService>();
builder.Services.AddScoped<IMedicineService, MedicineService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IVisitService, VisitService>();
builder.Services.AddScoped<IAssignmentService, SEP490_BE.Services.AssignmentServices.AssignmentService>();
builder.Services.AddScoped<IMaterialService, MaterialService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IMedicalRecordService, MedicalRecordService>();
builder.Services.AddScoped<IExaminationResultService, ExaminationResultService>();
builder.Services.AddScoped<IPrescriptionService, PrescriptionService>();    
builder.Services.AddScoped<ILaboratoryResultService, LaboratoryResultService>();
builder.Services.AddScoped<IFileService, FileService>();



builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IDoctorProfileRepository, DoctorProfileRepository>();
builder.Services.AddScoped<IExaminationRoomRepository, ExaminationRoomRepository>();
builder.Services.AddScoped<ILaboratoryRoomRepository, LaboratoryRoomRepository>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IPatientProfileRepository, PatientProfileRepository>();
builder.Services.AddScoped<IScheduleRepository, ScheduleRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IScheduleChangeRepository, ScheduleChangeRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<INotificationHubService, NotificationHubService>();
builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();
builder.Services.AddScoped<ITimeSlotRepository, TimeSlotRepository>();
builder.Services.AddScoped<IMedicineRepository, MedicineRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IVisitRepository, VisitRepository>();
builder.Services.AddScoped<IAssignmentRepository, AssignmentRepository>();
builder.Services.AddScoped<IMaterialRepository, MaterialRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IMedicalRecordRepository, MedicalRecordRepository>();
builder.Services.AddScoped<IExaminationResultRepository, ExaminationResultRepository>();
builder.Services.AddScoped<ILaboratoryFileRepository, LaboratoryFileRepository>();
builder.Services.AddScoped<ILaboratoryResultRepository, LaboratoryResultRepository>();
builder.Services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();




#endregion



var app = builder.Build();
// dể luôn bật kể kả production
    app.UseSwagger();
    app.UseSwaggerUI();

CreateAdmin(app.Services);

app.UseMiddleware<UnsupportedMediaTypeMiddleware>();

app.UseMiddleware<GlobalExceptionHandler>();

app.UseHttpsRedirection();

// tạm thời để dev
app.UseCors("AllowAllOrigins");
// sau chuyển lại
// app.UseCors("AllowFrontend");

app.UseRouting();

// Serve static files from external uploads directory FIRST (more specific)
//app.UseStaticFiles(new StaticFileOptions
//{
//    FileProvider = new PhysicalFileProvider("/opt/khanhan/uploads"),
//    RequestPath = "/uploads",
//    ServeUnknownFileTypes = true,
//    DefaultContentType = "application/octet-stream"
//});

// Serve static files from wwwroot (fallback)
app.UseStaticFiles();

app.UseAuthentication();

app.UseMiddleware<ActiveUserMiddleware>();

app.UseAuthorization();
app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<KhanhAnHub>("/khanhanHub");
});
app.MapControllers();

app.UseMiddleware<NotFoundMiddleware>();

app.UseHangfireDashboard("/hangfire");

RecurringJob.AddOrUpdate<IAppointmentService>(
    "auto-expire-appointments",
    service => service.AutoExpired(),
    "59 23 * * *", // cron expression: 23:59 mỗi ngày
    TimeZoneInfo.Local
);

app.Run();

#region Create ADMIN
void CreateAdmin(IServiceProvider services)
{
    try
    {
        using var scope = services.CreateScope();
        var _context = scope.ServiceProvider.GetRequiredService<KhanhAnNeurologyClinicContext>();

        var adminRole = _context.Roles.FirstOrDefault(r => r.Name == RoleConstants.Admin);
        if (adminRole == null)
        {
            adminRole = new SEP490_BE.Entities.Role
            {
                Name = RoleConstants.Admin
            };
            _context.Roles.Add(adminRole);
            _context.SaveChanges();
        }

        var adminUserRole = _context.UserRoles.Where(ur => ur.RoleName == adminRole.Name).FirstOrDefault();
        if (adminUserRole != null)
        {
            return;
        }

        string password = "12345678";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
        var admin = new User
        {
            Id = Guid.NewGuid().ToString(),
            Name = RoleConstants.Admin,
            PhoneNumber = "0963657883", // So test
            Email = "khanhanclinic@gmail.com",
            Password = hashedPassword,
            DateOfBirth = new DateTime(2003, 9, 14),
            Gender = "Male",
            Address = "111A12, Nghách 15, Ngõ 4, Phương Mai, Đống Đa, Hà Nội",
            IsActive = true,
        };

        _context.Users.Add(admin);
        _context.SaveChanges();

        _context.UserRoles.Add(new UserRole
        {
            UserId = admin.Id,
            RoleName = RoleConstants.Admin,
        });

        _context.SaveChanges();
        Console.WriteLine("Inittialized ADMIN account successfully with the password: 12345678, please change it!!!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] Failed to create admin: {ex.Message}");
    }
}
#endregion
