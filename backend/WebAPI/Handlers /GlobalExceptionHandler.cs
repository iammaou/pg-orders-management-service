using Microsoft.AspNetCore.Diagnostics;
using WebAPI.DTO;

namespace WebAPI.Handlers;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger,
        IHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // Log the exception
        _logger.LogError(exception, "Exception occurred: {Message}", exception.Message);

        // Determine status code based on exception type
        var statusCode = exception switch
        {
            ArgumentException => StatusCodes.Status400BadRequest,
            KeyNotFoundException => StatusCodes.Status404NotFound,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError
        };

        // Create the error response
        var errorResponse = new ErrorResponse
        {
            StatusCode = statusCode,
            Title = GetTitleForException(exception),
            TraceId = httpContext.TraceIdentifier,
            Detail = _env.IsDevelopment() ? exception.ToString() : null, // Only show details in dev
            Timestamp = DateTime.UtcNow
        };

        // Set the response
        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";

        await httpContext.Response.WriteAsJsonAsync(errorResponse, cancellationToken);

        return true; // We handled the exception
    }

    private static string GetTitleForException(Exception exception)
    {
        return exception switch
        {
            ArgumentException => "Invalid request parameters",
            KeyNotFoundException => "Resource not found",
            UnauthorizedAccessException => "Unauthorized access",
            _ => "An unexpected error occurred"
        };
    }
}