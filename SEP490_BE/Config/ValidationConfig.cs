using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using static SEP490_BE.DTO.ErrorResponse;

namespace SEP490_BE.Config
{
    public class ValidationConfig
    {
        public static void Configure(ApiBehaviorOptions options)
        {
            options.InvalidModelStateResponseFactory = context =>
            {
                var errors = context.ModelState
                    .Where(e => e.Value.Errors.Count > 0)
                    .Select(e => new FieldError
                    {
                        Field = e.Key,
                        Error = e.Value.Errors.First().ErrorMessage
                    }).ToList();

                var response = new ErrorResponse
                {
                    StatusCode = 400,
                    Message = MessageConstants.VALIDATION_ERROR,
                    Errors = errors
                };

                return new BadRequestObjectResult(response);
            };
        }
    }
}
