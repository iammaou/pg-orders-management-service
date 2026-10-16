using System.Security.Cryptography;
using System.Text;

namespace WebAPI.Middleware;

public class ApiKeyMiddleware(RequestDelegate next)
{

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/health"))
        {
            await next(context);
            return;
        }
        
        
        var headerKey = context.Request.Headers["X-API-Key"].ToString();

        if(string.IsNullOrWhiteSpace(headerKey))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("API key is required.");
            return;
        }

        var apiKeys = Environment.GetEnvironmentVariable("API_KEYS")?.Split(',').Select(k => k.Trim());
        if(apiKeys != null)
        {
            bool check = false;
            foreach(var key in apiKeys)
            {
                if(CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(headerKey), Encoding.UTF8.GetBytes(key)))
                {
                    check = true;
                    break;
                }
            }

            if (!check)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Incorrect API_KEY");
                return; 
            }

            await next(context);
            return;
        }

        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("API_KEYS were not setup");
        return;
    }    
}