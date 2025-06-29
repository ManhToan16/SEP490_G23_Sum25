using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.Repositories.UserRepositories;
using System.Text.Json;

namespace SEP490_BE.Middleware
{
    public class ActiveUserMiddleware
    {
        private readonly RequestDelegate _next;

        public ActiveUserMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IUserRepository userRepository)
        {
            var user = context.User;
            if (user.Identity?.IsAuthenticated == true)
            {
                var userId = user.FindFirst("UserId")?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    var dbUser = await userRepository.FindById(userId);
                    if (dbUser != null && dbUser.IsActive == false)
                    {
                        var errorResponse = new ErrorResponse
                        {
                            StatusCode = 401,
                            Message = MessageConstants.UNAUTHENTICATED_ERROR,
                            Errors = null
                        };

                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";
                        var json = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
                        {
                            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                        });
                        await context.Response.WriteAsync(json);
                        return;
                    }
                }
            }

            await _next(context);
        }
    }

}
