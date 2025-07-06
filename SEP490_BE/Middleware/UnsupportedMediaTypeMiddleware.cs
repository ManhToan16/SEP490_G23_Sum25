using Microsoft.AspNetCore.Http;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using System.Text.Json;
using System.Threading.Tasks;

namespace SEP490_BE.Middleware
{
    public class UnsupportedMediaTypeMiddleware
    {
        private readonly RequestDelegate _next;

        public UnsupportedMediaTypeMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Hook vào sự kiện xử lý response
            context.Response.OnStarting(() =>
            {
                if (context.Response.StatusCode == StatusCodes.Status415UnsupportedMediaType)
                {
                    context.Response.ContentType = "application/json";

                    var result = JsonSerializer.Serialize(new ErrorResponse
                    {
                        StatusCode = 415,
                        Message = MessageConstants.UNSUPPORTED_MEDIA_TYPE
                    });

                    var bytes = System.Text.Encoding.UTF8.GetBytes(result);
                    context.Response.ContentLength = bytes.Length;

                    return context.Response.Body.WriteAsync(bytes, 0, bytes.Length);
                }

                return Task.CompletedTask;
            });

            await _next(context);
        }
    }
}
