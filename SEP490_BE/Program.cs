using Microsoft.EntityFrameworkCore;
using SEP490_BE.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<KhanhAnNeurologyClinicContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("MyCnn"));
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseHttpsRedirection(); // Enforce HTTPS
app.UseStaticFiles(); // Serve static files (if any, e.g., images, CSS)
app.UseRouting(); // Enable routing

// Enable CORS (if configured)
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
