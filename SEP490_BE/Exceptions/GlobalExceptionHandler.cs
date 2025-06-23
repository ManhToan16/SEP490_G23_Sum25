using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Text.Json;

namespace SEP490_BE.Exceptions
{
    public class GlobalExceptionHandler
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionHandler(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                var statusCode = 500;
                string message = MessageConstants.UNCATEGORIZED_ERROR;

                if (ex is ValidationException ||
                    ex is InvalidOperationException ||
                    ex is ArgumentNullException ||
                    ex is BadHttpRequestException ||
                    ex is ArgumentException)
                {
                    statusCode = 400;
                    message = string.IsNullOrEmpty(ex.Message) ? MessageConstants.VALIDATION_ERROR : ex.Message;
                }
                else if (ex is UnauthenticatedException)
                {
                    statusCode = 401;
                    message = string.IsNullOrEmpty(ex.Message) ? MessageConstants.UNAUTHENTICATED_ERROR : ex.Message;
                }
                else if (ex is UnauthorizedAccessException)
                {
                    statusCode = 403;
                    message = string.IsNullOrEmpty(ex.Message) ? MessageConstants.UNAUTHORIZED_ERROR : ex.Message;
                }
                else if (ex is KeyNotFoundException ||
                         ex is ResourceNotFoundException)
                {
                    statusCode = 404;
                    message = string.IsNullOrEmpty(ex.Message) ? MessageConstants.NOT_FOUND : ex.Message;
                }
                else if (ex is ConflictDataException ||
                         ex is DBConcurrencyException)
                {
                    statusCode = 409;
                    message = string.IsNullOrEmpty(ex.Message) ? MessageConstants.CONFLICT_ERROR : ex.Message;
                }
                else if (ex is DbUpdateException ||
                         ex is SqlException)
                {
                    statusCode = 500;
                    message = string.IsNullOrEmpty(ex.Message) ? MessageConstants.DB_ERROR : ex.Message;
                }
                else if (ex is IOException ||
                         ex is ApplicationException)
                {
                    statusCode = 500;
                    message = string.IsNullOrEmpty(ex.Message) ? MessageConstants.UNCATEGORIZED_ERROR : ex.Message;
                }

                context.Response.StatusCode = statusCode;
                context.Response.ContentType = "application/json";

                var response = JsonSerializer.Serialize(
                    new ErrorResponse
                    {
                        StatusCode = statusCode,
                        Message = message
                    }
                );
                await context.Response.WriteAsync(response);
            }
        }
    }
}
