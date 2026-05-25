using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace VisualizationDSA.WebApi.Middlewares;

/// <summary>
/// Middleware xử lý lỗi tập trung.
/// Bắt mọi Exception chưa được xử lý, ghi log và trả về JSON chuẩn hóa.
/// Ngăn chặn stack trace lộ ra bên ngoài ở môi trường Production.
/// </summary>
public sealed class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ErrorHandlingMiddleware(
        RequestDelegate next,
        ILogger<ErrorHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next    = next;
        _logger  = logger;
        _env     = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception at {Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title) = exception switch
        {
            ArgumentException           => (HttpStatusCode.BadRequest,            "Bad Request"),
            KeyNotFoundException        => (HttpStatusCode.NotFound,              "Not Found"),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized,          "Unauthorized"),
            OperationCanceledException  => (HttpStatusCode.RequestTimeout,         "Request Timeout"),
            DbUpdateConcurrencyException => (HttpStatusCode.Conflict,              "Conflict"),
            _                           => (HttpStatusCode.InternalServerError,   "Internal Server Error")
        };

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode  = (int)statusCode;

        var problemDetails = new ProblemDetails
        {
            Status   = (int)statusCode,
            Title    = title,
            Detail   = _env.IsDevelopment() ? exception.Message : "An unexpected error occurred. Please try again later.",
            Instance = context.Request.Path,
            Type     = $"https://httpstatuses.io/{(int)statusCode}"
        };

        problemDetails.Extensions["traceId"] = context.TraceIdentifier;

        if (_env.IsDevelopment())
        {
            problemDetails.Extensions["exception"] = exception.ToString();
        }

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy         = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition       = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        });

        await context.Response.WriteAsync(json);
    }
}

/// <summary>Extension method để đăng ký middleware gọn hơn trong Program.cs</summary>
public static class ErrorHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalErrorHandling(this IApplicationBuilder app)
        => app.UseMiddleware<ErrorHandlingMiddleware>();
}
