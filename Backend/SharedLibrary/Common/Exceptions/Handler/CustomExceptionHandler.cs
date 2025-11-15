using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace SharedLibrary.Common.Exceptions.Handler;

public class CustomExceptionHandler(ILogger<CustomExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception,
    CancellationToken cancellationToken)
    {
        logger.LogError(
            "Error: {Exception} - Message: {Message} - Time: {Time}",
            exception.GetType().Name,
            exception.Message,
            DateTime.UtcNow);

        var (detail, title, statusCode) = MapExceptionToResponse(exception);

        var problemDetails = new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = statusCode,
            Instance = context.Request.Path
        };

        problemDetails.Extensions.Add("traceId", context.TraceIdentifier);

        if (exception is ValidationException validationException)
        {
            problemDetails.Extensions.Add("validationErrors", validationException.Errors);
        }

        await context.Response.WriteAsJsonAsync(problemDetails, cancellationToken: cancellationToken);
        return true;
    }

    private static (string Detail, string Title, int StatusCode) MapExceptionToResponse(Exception exception)
    {
        return exception switch
        {
            // 400 Bad Request
            ValidationException => (exception.Message, exception.GetType().Name, StatusCodes.Status400BadRequest),
            BadRequestException => (exception.Message, exception.GetType().Name, StatusCodes.Status400BadRequest),

            // 401 Unauthorized
            UnauthorizedException => (exception.Message, exception.GetType().Name, StatusCodes.Status401Unauthorized),

            // 404 Not Found
            NotFoundException => (exception.Message, exception.GetType().Name, StatusCodes.Status404NotFound),

            // 409 Conflict
            ConflictException => (exception.Message, exception.GetType().Name, StatusCodes.Status409Conflict),

            // 500 Internal Server Error
            InternalServerException => (exception.Message, exception.GetType().Name, StatusCodes.Status500InternalServerError),

            // Default
            _ => (exception.Message, exception.GetType().Name, StatusCodes.Status500InternalServerError)
        };
    }
}