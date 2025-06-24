using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.AuthDTO;
using SEP490_BE.Services.AuthServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IWebHostEnvironment _env;

        public AuthController(
            IAuthService authService,
            IWebHostEnvironment env)
        {
            _authService = authService;
            _env = env;
        }


        [HttpPost("Login")]
        public async Task<ActionResult<ApiResponse>> Login(LoginRequestDTO request)
        {
            var response = await _authService.Login(request);
            var apiResponse = new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.LOGIN_SUCCESS,
                Data = response
            };
            return StatusCode(apiResponse.StatusCode, apiResponse);
        }

        [HttpPost("RefreshToken")]
        public async Task<ActionResult<ApiResponse>> RefreshToken(TokenRequestDTO model)
        {
            var response = await _authService.RefreshToken(model);
            var apiResponse = new ApiResponse
            {
                StatusCode = 200,
                Success = true,
                Message = MessageConstants.REFRESH_TOKEN_SUCCESS,
                Data = response
            };
            return StatusCode(apiResponse.StatusCode, apiResponse);
        }

        [HttpPost("Logout")]
        public async Task<ActionResult<ApiResponse>> Logout(TokenRequestDTO request)
        {
            await _authService.Logout(request);
            var apiResponse = new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.LOGOUT_SUCCESS,
                Data = null
            };
            return StatusCode(apiResponse.StatusCode, apiResponse);
        }

        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO request)
        {
            await _authService.ForgotPassword(request);
            var apiResponse = new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = "Check your email for reset password requirement.",
                Data = null
            };
            return StatusCode(apiResponse.StatusCode, apiResponse);
        }

        [HttpGet("ResetPassword")]
        public IActionResult ResetPasswordForm([FromQuery] string token)
        {
            var filePath = Path.Combine(_env.ContentRootPath, "Templates", "reset-password-form.html");
            var html = System.IO.File.ReadAllText(filePath);
            html = html.Replace("{{token}}", token);
            return Content(html, "text/html");
        }

        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromForm] string token, [FromForm] string newPassword)
        {
            await _authService.ResetPassword(token, newPassword);
            var filePath = Path.Combine(_env.ContentRootPath, "Templates", "reset-password-success.html");
            var html = await System.IO.File.ReadAllTextAsync(filePath);
            return Content(html, "text/html");
        }

    }
}
