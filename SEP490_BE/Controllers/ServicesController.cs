using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.DTO.ServiceDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.ServiceServices;
using SEP490_BE.Constants;
using SEP490_BE.DTO.LaboratoryRoomDTO;

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
            var data = dto != null ? new List<ServiceResponseDTO> { dto } : new List<ServiceResponseDTO>();

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = data
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDTO dto)
        {
            var createdDto = await _serviceService.Create(dto);
            var data = createdDto != null ? new List<ServiceResponseDTO> { createdDto } : new List<ServiceResponseDTO>();

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = data
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(string id, [FromBody] UpdateServiceDTO dto)
        {
            var updatedDto = await _serviceService.Update(id, dto);
            var data = updatedDto != null ? new List<ServiceResponseDTO> { updatedDto } : new List<ServiceResponseDTO>();

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = data
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
                Data = new List<object>()
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
