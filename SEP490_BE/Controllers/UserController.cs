using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.UserDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.UserServices;
using Microsoft.AspNetCore.Authorization;
using BackendProject.Utils;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(
            IUserService userService)
        {
            _userService = userService;
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPost]
        public async Task<ActionResult<ApiResponse>> Create([FromBody] CreateUserDTO request)
        {
            var result = await _userService.Create(request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = result
            });
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetAll(
                [FromQuery] string? role,
                [FromQuery] string? email,
                [FromQuery] string? phoneNumber,
                [FromQuery] string? name,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 10)
        {
            var result = await _userService.GetAll(role, email, phoneNumber, name, pageNumber, pageSize);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize]
        [HttpGet("{userId}")]
        public async Task<ActionResult<ApiResponse>> GetById(string userId)
        {
            var result = await _userService.GetUserById(userId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [RequiredOwner]
        [HttpPut("{userId}")]
        public async Task<ActionResult<ApiResponse>> Update(string userId, [FromBody] UpdateUserDTO request)
        {
            var result = await _userService.Update(userId, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpDelete("{userId}")]
        public async Task<ActionResult<ApiResponse>> Delete(string userId)
        {
            await _userService.Delete(userId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }
        
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("active/{userId}")]
        public async Task<ActionResult<ApiResponse>> Activate(string userId)
        {
            await _userService.Activate(userId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = null
            });
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("deactive/{userId}")]
        public async Task<ActionResult<ApiResponse>> Deactivate(string userId)
        {
            await _userService.Deactivate(userId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = null
            });
        }

    }
}
