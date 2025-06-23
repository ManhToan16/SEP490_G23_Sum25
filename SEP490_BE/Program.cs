using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SEP490_BE.Models;
using SEP490_BE.Repositories;
using SEP490_BE.Repositories.impl;

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
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Khanh An Neurology Clinic API", Version = "v1" });
});
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddScoped<IDoctorProfileRepository, DoctorProfileRepository>();
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


app.UseAuthorization();

app.MapControllers();

app.Run();
