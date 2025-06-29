using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.DTO.ServiceDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.ServiceServices;
using SEP490_BE.Constants;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public ServicesController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetService(string id)
        {
            var dto = await _serviceService.GetById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = dto
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDTO dto)
        {
            var createdDto = await _serviceService.Create(dto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = createdDto
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(string id, [FromBody] UpdateServiceDTO dto)
        {
            var updatedDto = await _serviceService.Update(id, dto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = updatedDto
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(string id)
        {
            await _serviceService.Delete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllServices(
            string? laboratoryRoomId = null,
            string? name = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string? description = null,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var pagination = await _serviceService.GetAll(laboratoryRoomId, name, minPrice, maxPrice, description, pageNumber, pageSize);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = pagination
            });
        }
    }
}
