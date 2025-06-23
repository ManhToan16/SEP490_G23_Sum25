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

#region API Validation Config
builder.Services.Configure<ApiBehaviorOptions>(ValidationConfig.Configure);
#endregion

#region Redis
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect("localhost:6379"));
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

builder.Services.AddHttpContextAccessor();
#region Scope
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
#endregion



var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowAll");
app.UseHttpsRedirection(); 
app.UseStaticFiles(); 
app.UseRouting(); 

// Configure the HTTP request pipeline.


app.UseMiddleware<GlobalExceptionHandler>();

app.UseMiddleware<NotFoundMiddleware>();

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("AllowAllOrigins");

app.UseAuthentication();

app.UseAuthorization();

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
