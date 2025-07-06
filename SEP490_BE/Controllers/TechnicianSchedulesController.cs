using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.DTO.TechnicianScheduleDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.TechnicianScheduleServices;
using SEP490_BE.Constants;
using SEP490_BE.DTO.LaboratoryRoomDTO;
using SEP490_BE.DTO.DoctorScheduleDTO;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TechnicianSchedulesController : ControllerBase
    {
        private readonly ITechnicianScheduleService _technicianScheduleService;

        public TechnicianSchedulesController(ITechnicianScheduleService technicianScheduleService)
        {
            _technicianScheduleService = technicianScheduleService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTechnicianSchedule(string id)
        {
            var dto = await _technicianScheduleService.GetById(id);
            var data = dto != null ? new List<TechnicianScheduleResponseDTO> { dto } : new List<TechnicianScheduleResponseDTO>();

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { dto }
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateTechnicianSchedule([FromBody] CreateTechnicianScheduleDTO dto)
        {
            var createdDto = await _technicianScheduleService.Create(dto);
            var data = createdDto != null ? new List<TechnicianScheduleResponseDTO> { createdDto } : new List<TechnicianScheduleResponseDTO>();

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { createdDto }
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTechnicianSchedule(string id, [FromBody] UpdateTechnicianScheduleDTO dto)
        {
            var updatedDto = await _technicianScheduleService.Update(id, dto);
            var data = updatedDto != null ? new List<TechnicianScheduleResponseDTO> { updatedDto } : new List<TechnicianScheduleResponseDTO>();

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { updatedDto }
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTechnicianSchedule(string id)
        {
            await _technicianScheduleService.Delete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = new List<object>()
            });
        }

        [HttpGet("technician/{technicianId}")]
        public async Task<IActionResult> GetTechnicianSchedulesByTechnicianId(
             string technicianId,
             DateTime fromDate,
             DateTime toDate)
        {
            var schedules = await _technicianScheduleService.GetTechnicianSchedulesByTechnicianId(technicianId, fromDate, toDate);
            var data = schedules?.ToList() ?? new List<TechnicianScheduleResponseDTO>();

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = data
            });
        }

        [HttpGet("Range")]
        public async Task<IActionResult> GetTechnicianSchedulesByRange(
            DateTime fromDate,
            DateTime toDate)
        {
            var schedules = await _technicianScheduleService.GetTechnicianSchedulesByRange(fromDate, toDate);
            var data = schedules?.ToList() ?? new List<TechnicianScheduleResponseDTO>();

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = data
            });
        }

        [HttpGet("room/{laboratoryRoomId}")]
        public async Task<IActionResult> GetTechnicianSchedulesByLaboratoryRoom(
            string laboratoryRoomId,
            DateTime fromDate,
            DateTime toDate)
        {
            var schedules = await _technicianScheduleService.GetTechnicianSchedulesByLaboratoryRoom(laboratoryRoomId, fromDate, toDate);
            var data = schedules?.ToList() ?? new List<TechnicianScheduleResponseDTO>();

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = data
            });
        }
    }
}
