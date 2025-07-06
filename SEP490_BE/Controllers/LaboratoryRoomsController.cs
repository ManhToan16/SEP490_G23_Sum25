using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.DTO.LaboratoryRoomDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.LaboratoryRoomServices;
using SEP490_BE.Constants;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LaboratoryRoomsController : ControllerBase
    {
        private readonly ILaboratoryRoomService _laboratoryRoomService;

        public LaboratoryRoomsController(ILaboratoryRoomService laboratoryRoomService)
        {
            _laboratoryRoomService = laboratoryRoomService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLaboratoryRoom(string id)
        {
            var dto = await _laboratoryRoomService.GetById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { dto }
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateLaboratoryRoom([FromBody] CreateLaboratoryRoomDTO dto)
        {
            var createdDto = await _laboratoryRoomService.Create(dto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { createdDto }
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLaboratoryRoom(string id, [FromBody] UpdateLaboratoryRoomDTO dto)
        {
            var updatedDto = await _laboratoryRoomService.Update(id, dto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { updatedDto }
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLaboratoryRoom(string id)
        {
            await _laboratoryRoomService.Delete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLaboratoryRooms(
            string? name = null,
            string? description = null,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var pagination = await _laboratoryRoomService.GetAll(name, description, pageNumber, pageSize);
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
