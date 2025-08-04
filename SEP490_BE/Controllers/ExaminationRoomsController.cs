using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.ExaminationRoomDTO;
using SEP490_BE.Hubs;
using SEP490_BE.Services.ExaminationRoomServices;


namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExaminationRoomsController : ControllerBase
    {
        private readonly IExaminationRoomService _examinationRoomService;
        private readonly INotificationHubService _notificationHubService;

        public ExaminationRoomsController(
            IExaminationRoomService examinationRoomService,
            INotificationHubService notificationHubService)
        {
            _examinationRoomService = examinationRoomService;
            _notificationHubService = notificationHubService;
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
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPost]
        public async Task<IActionResult> CreateExaminationRoom([FromBody] CreateExaminationRoomDTO dto)
        {
            var createdDto = await _examinationRoomService.Create(dto);
            var data = createdDto != null ? new List<ExaminationRoomResponseDTO> { createdDto } : new List<ExaminationRoomResponseDTO>();
            await _notificationHubService.SendExaminationRoomUpdate(createdDto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { createdDto }
            });
        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExaminationRoom(string id, [FromBody] UpdateExaminationRoomDTO dto)
        {
            var updatedDto = await _examinationRoomService.Update(id, dto);
            var data = updatedDto != null ? new List<ExaminationRoomResponseDTO> { updatedDto } : new List<ExaminationRoomResponseDTO>();
            await _notificationHubService.SendExaminationRoomUpdate(updatedDto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { updatedDto }
            });
        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExaminationRoom(string id)
        {
            await _examinationRoomService.Delete(id);
            await _notificationHubService.SendExaminationRoomDelete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = new List<object>() 
            });
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var dto = await _examinationRoomService.GetActiveExaminationRoomsAsync();        
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { dto }
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
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("examination/{id}/active")]
        public async Task<IActionResult> ActiveExamination(string id)
        {
            await _examinationRoomService.ActiveExaminationRoom(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new List<object>()
            });
            
        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("examination/{id}/inactive")]
        public async Task<IActionResult> InactiveExamination(string id)
        {
            await _examinationRoomService.InactiveExaminationRoom(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new List<object>()
            });
        }
        [HttpGet("ByDate")]
        public async Task<IActionResult> GetExaminationRoomsByDate(
             [FromQuery] TimeSpan time ,
             [FromQuery] DateTime date )
        {
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
