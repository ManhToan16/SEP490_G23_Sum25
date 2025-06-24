using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.DTO.ExaminationRoomDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.ExaminationRoomServices;
using SEP490_BE.Constants;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExaminationRoomsController : ControllerBase
    {
        private readonly IExaminationRoomService _examinationRoomService;

        public ExaminationRoomsController(IExaminationRoomService examinationRoomService)
        {
            _examinationRoomService = examinationRoomService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetExaminationRoom(string id)
        {
            var dto = await _examinationRoomService.GetById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = dto
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateExaminationRoom([FromBody] CreateExaminationRoomDTO dto)
        {
            var createdDto = await _examinationRoomService.Create(dto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = createdDto
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExaminationRoom(string id, [FromBody] UpdateExaminationRoomDTO dto)
        {
            var updatedDto = await _examinationRoomService.Update(id, dto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = updatedDto
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExaminationRoom(string id)
        {
            await _examinationRoomService.Delete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllExaminationRooms(
            string? name = null,
            string? description = null,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var pagination = await _examinationRoomService.GetAll(name, description, pageNumber, pageSize);
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
