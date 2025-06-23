using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.UserDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.UserServices;
using Microsoft.AspNetCore.Authorization;

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
                Data = result
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse>> GetById(string id)
        {
            var result = await _userService.GetUserById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = result
            });
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse>> Update(string id, [FromBody] UpdateUserDTO request)
        {
            var result = await _userService.Update(id, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = result
            });
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse>> Delete(string id)
        {
            await _userService.Delete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }


    }
}
