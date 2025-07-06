using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.DTO.ExaminationRoomDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.ExaminationRoomServices;
using SEP490_BE.Constants;
using SEP490_BE.DTO.DoctorScheduleDTO;

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
            var data = dto != null ? new List<ExaminationRoomResponseDTO> { dto } : new List<ExaminationRoomResponseDTO>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { dto }
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateExaminationRoom([FromBody] CreateExaminationRoomDTO dto)
        {
            var createdDto = await _examinationRoomService.Create(dto);
            var data = createdDto != null ? new List<ExaminationRoomResponseDTO> { createdDto } : new List<ExaminationRoomResponseDTO>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { createdDto }
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExaminationRoom(string id, [FromBody] UpdateExaminationRoomDTO dto)
        {
            var updatedDto = await _examinationRoomService.Update(id, dto);
            var data = updatedDto != null ? new List<ExaminationRoomResponseDTO> { updatedDto } : new List<ExaminationRoomResponseDTO>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { updatedDto }
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
                Data = new List<object>() 
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
                Data = new[] { pagination }
            });
        }

        [HttpGet("ByDate")]
        public async Task<IActionResult> GetExaminationRoomsByDate(
             [FromQuery] TimeSpan time ,
             [FromQuery] DateTime date )
        {
            if (time == default) time = DateTime.Now.TimeOfDay;
            if (date == default) date = DateTime.Today;

            var rooms = await _examinationRoomService.GetExaminationRoomsByDate(time, date);
            var data = rooms?.ToList() ?? new List<ExaminationRoomWithDoctorDTO>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = rooms
            });
        }

    }
}
