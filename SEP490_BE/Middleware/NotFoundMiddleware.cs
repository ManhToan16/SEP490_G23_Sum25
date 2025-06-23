using SEP490_BE.Constants;
using SEP490_BE.DTO;
using System.Text.Json;

namespace SEP490_BE.Middleware
{
    public class NotFoundMiddleware
    {
        private readonly RequestDelegate _next;

        public NotFoundMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            await _next(context);

            var response = context.Response;

            if (response.StatusCode == 404 || response.StatusCode == 405)
            {
                response.ContentType = "application/json";
                var result = JsonSerializer.Serialize(new ErrorResponse
                {
                    StatusCode = response.StatusCode,
                    Message = response.StatusCode == 404 ? MessageConstants.ENDPOINT_NOT_FOUND : MessageConstants.METHOD_NOT_FOUND,
                });

                await response.WriteAsync(result);
            }
        }
    }
}
