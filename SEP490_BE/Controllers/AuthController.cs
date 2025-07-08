using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.AuthDTO;
using SEP490_BE.Services.AuditLogServices;
using SEP490_BE.Services.AuthServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;
        private readonly IAuthService _authService;
        private readonly IWebHostEnvironment _env;

        public AuthController(
            IAuthService authService,
            IAuditLogService auditLogService,
            IWebHostEnvironment env)
        {
            _auditLogService = auditLogService;
            _authService = authService;
            _env = env;
        }


        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse>> Login(LoginRequestDTO request)
        {
            var response = await _authService.Login(request);
            var apiResponse = new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.LOGIN_SUCCESS,
                Data = new[] { response }
            };
            return StatusCode(apiResponse.StatusCode, apiResponse);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<ApiResponse>> RefreshToken(TokenRequestDTO model)
        {
            var response = await _authService.RefreshToken(model);
            var apiResponse = new ApiResponse
            {
                StatusCode = 200,
                Success = true,
                Message = MessageConstants.REFRESH_TOKEN_SUCCESS,
                Data = new[] { response }
            };
            return StatusCode(apiResponse.StatusCode, apiResponse);
        }

        [HttpPost("logout")]
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

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO request)
        {
            await _authService.ForgotPassword(request);
            var apiResponse = new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = "Check your email to reset password.",
                Data = null
            };
            return StatusCode(apiResponse.StatusCode, apiResponse);
        }

        [HttpGet("reset-password")]
        public IActionResult ResetPasswordForm([FromQuery] string token)
        {
            var filePath = Path.Combine(_env.ContentRootPath, "Templates", "reset-password-form.html");
            var html = System.IO.File.ReadAllText(filePath);
            html = html.Replace("{{token}}", token);
            return Content(html, "text/html");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromForm] string token, [FromForm] string newPassword)
        {
            await _authService.ResetPassword(token, newPassword);
            var apiResponse = new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.CHANGE_PASSWORD_SUCCESS,
                Data = null
            };
            return StatusCode(apiResponse.StatusCode, apiResponse);
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO request)
        {
            await _authService.ChangePassword(request);
            var apiResponse = new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = null
            };
            return StatusCode(apiResponse.StatusCode, apiResponse);
        }


        [HttpGet("log")]
        public async Task<ActionResult<ApiResponse>> GetAuditLogs(
                [FromQuery] string? userId,
                [FromQuery] string? action,
                [FromQuery] string? tableName,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 10)
        {
            var response = await _auditLogService.GetLogsAsync(userId, action, tableName, pageNumber, pageSize);
            var apiResponse = new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { response }
            };
            return StatusCode(apiResponse.StatusCode, apiResponse);
        }
    }
}
