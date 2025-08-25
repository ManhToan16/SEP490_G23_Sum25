using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.ExaminationRoomDTO;
using SEP490_BE.DTO.LaboratoryRoomDTO;
using SEP490_BE.Hubs;
using SEP490_BE.Services.LaboratoryRoomServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LaboratoryRoomsController : ControllerBase
    {
        private readonly ILaboratoryRoomService _laboratoryRoomService;
        private readonly INotificationHubService _notificationHubService;

        public LaboratoryRoomsController(ILaboratoryRoomService laboratoryRoomService, INotificationHubService notificationHubService)
        {
            _laboratoryRoomService = laboratoryRoomService;
            _notificationHubService = notificationHubService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLaboratoryRoom(string id)
        {
            var dto = await _laboratoryRoomService.GetById(id);
            var data = dto != null ? new List<LaboratoryRoomResponseDTO> { dto } : new List<LaboratoryRoomResponseDTO>();

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
        public async Task<IActionResult> CreateLaboratoryRoom([FromBody] CreateLaboratoryRoomDTO dto)
        {
            var createdDto = await _laboratoryRoomService.Create(dto);
            var data = createdDto != null ? new List<LaboratoryRoomResponseDTO> { createdDto } : new List<LaboratoryRoomResponseDTO>();
            await _notificationHubService.SendLaboratoryRoomUpdate(createdDto,"Create");
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
        public async Task<IActionResult> UpdateLaboratoryRoom(string id, [FromBody] UpdateLaboratoryRoomDTO dto)
        {
            var updatedDto = await _laboratoryRoomService.Update(id, dto);
            var data = updatedDto != null ? new List<LaboratoryRoomResponseDTO> { updatedDto } : new List<LaboratoryRoomResponseDTO>();
            await _notificationHubService.SendLaboratoryRoomUpdate(updatedDto,"Update");

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
        public async Task<IActionResult> DeleteLaboratoryRoom(string id)
        {
            await _laboratoryRoomService.Delete(id);
            await _notificationHubService.SendLaboratoryRoomDelete(id);

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = new List<object>()
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
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("laboratory/{id}/active")]
        public async Task<IActionResult> ActiveLaboratory(string id)
        {
            await _laboratoryRoomService.ActiveLaboratoryRoom(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = new List<object>()
            });
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("laboratory/{id}/inactive")]
        public async Task<IActionResult> InactiveLaboratory(string id)
        {
            await _laboratoryRoomService.InactiveLaboratoryRoom(id);
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
            var dto = await _laboratoryRoomService.GetActiveLaboratoryRoomsAsync();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { dto }
            });
        }
    }
}
