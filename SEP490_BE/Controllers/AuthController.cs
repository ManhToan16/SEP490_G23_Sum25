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

        public AuthController(
            IAuthService authService)
        {
            _authService = authService;
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

        [HttpGet("TestAuthenticatedUser")]
        public async Task<ActionResult<ApiResponse>> GetAuthenticatedUser()
        {
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = await _authService.GetAuthenticatedUser()
            });
        }

    }
}
