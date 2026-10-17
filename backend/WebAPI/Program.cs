using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Service.Data;
using Service.Services;
using Microsoft.AspNetCore.Mvc;
using WebAPI.Handlers;
using WebAPI.Middleware;
using Microsoft.AspNetCore.HttpOverrides;
using System.Net;
using System.Threading.RateLimiting;

Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);
var configOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
var envOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
var allowedOrigins = configOrigins.Concat(envOrigins).Select(o => o.Trim()).Distinct().ToArray();

// Add services to the container.

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .Select(e => new
                {
                    Field = e.Key,
                    Errors = e.Value?.Errors.Select(x => x.ErrorMessage)
                });

            return new BadRequestObjectResult(new
            {
                Title = "Validation failed",
                Errors = errors
            });
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    // 1. Define the security scheme for X-API-KEY
    c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Description = "API Key needed to access the endpoints. X-API-Key: {your-api-key}",
        Name = "X-API-KEY",               // The header name
        In = ParameterLocation.Header,    // It's a header
        Type = SecuritySchemeType.ApiKey, // API key type
        Scheme = "ApiKeyScheme"
    });

    // 2. Add a security requirement so Swagger knows to use it
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "ApiKey"
                }
            },
            new List<string>() // No scopes needed for an API key
        }
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = ConnectionStringBuilder.BuildFromEnv();
    options.UseSqlServer(connectionString);
});

builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddHealthChecks();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if(allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownIPNetworks.Add(new System.Net.IPNetwork(IPAddress.Parse("172.16.0.0"), 12));
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("StrictPolicy", context => 
        RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString(), _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromSeconds(30)
        }));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Product Catalog API V1");
        c.RoutePrefix = "swagger";
    });
}

app.UseExceptionHandler();

app.UseForwardedHeaders();

if (!app.Environment.IsProduction()) app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseRateLimiter();

app.UseMiddleware<ApiKeyMiddleware>();

try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "Database migration failed. Exiting so the container can restart.");
    Environment.Exit(1);
}

app.UseAuthorization();
app.MapControllers().RequireRateLimiting("StrictPolicy");
app.MapHealthChecks("/health").DisableRateLimiting();

app.Run();
