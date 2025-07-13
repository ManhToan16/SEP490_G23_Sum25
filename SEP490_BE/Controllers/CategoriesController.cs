using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SEP490_BE.Constants;
using SEP490_BE.DTO.CategoryDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.CategoryServices;
using SEP490_BE.Hubs;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly INotificationHubService _notificationHubService;

        public CategoriesController(ICategoryService categoryService, INotificationHubService notificationHubService)
        {
            _categoryService = categoryService;
            _notificationHubService = notificationHubService;

        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDTO request)
        {

            var category = await _categoryService.CreateCategory(request);
            await _notificationHubService.SendCategoryUpdate(category);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { category }
            });
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(string id, [FromBody] UpdateCategoryDTO request)
        {
 
            var category = await _categoryService.UpdateCategory(id, request);
            await _notificationHubService.SendCategoryUpdate(category);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { category }
            });
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(string id)
        {

            await _categoryService.DeleteCategory(id);
            await _notificationHubService.SendCategoryDelete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(string id)
        {
            var category = await _categoryService.GetCategoryById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { category }
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] string? name = null, [FromQuery] string? description = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pagination = await _categoryService.GetAllCategories(name, description, pageNumber, pageSize);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { pagination }
            });
        }
    }
}
