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
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.DoctorProfileRepositories;
using SEP490_BE.Repositories.ExaminationRoomRepositories;
using SEP490_BE.Repositories.LaboratoryRoomRepositories;
using SEP490_BE.Repositories.PatientProfileRepositories;
using SEP490_BE.Repositories.RoleRepositories;
using SEP490_BE.Repositories.ScheduleChangeRepositories;
using SEP490_BE.Repositories.ScheduleRepositories;
using SEP490_BE.Repositories.ServiceRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Services.AuditLogServices;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.DoctorProfileServices;
using SEP490_BE.Services.EmailServices;
using SEP490_BE.Services.ExaminationRoomServices;
using SEP490_BE.Services.LaboratoryRoomServices;
using SEP490_BE.Services.PatientProfileServices;
using SEP490_BE.Services.ScheduleChangeServices;
using SEP490_BE.Services.ScheduleServices;
using SEP490_BE.Services.ServiceServices;
using SEP490_BE.Services.UserServices;
using StackExchange.Redis;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

#region Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
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



#endregion



var app = builder.Build();
// dể luôn bật kể kả production
    app.UseSwagger();
    app.UseSwaggerUI();

CreateAdmin(app.Services);

app.UseMiddleware<UnsupportedMediaTypeMiddleware>();

app.UseMiddleware<GlobalExceptionHandler>();

app.UseMiddleware<NotFoundMiddleware>();

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");
app.UseRouting();



app.UseAuthentication();

app.UseMiddleware<ActiveUserMiddleware>();

app.UseAuthorization();
app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<ScheduleHub>("/scheduleHub");
});
app.MapControllers();

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
