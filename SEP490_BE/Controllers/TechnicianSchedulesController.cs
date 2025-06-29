using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.DTO.TechnicianScheduleDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.TechnicianScheduleServices;
using SEP490_BE.Constants;

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
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = dto
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateTechnicianSchedule([FromBody] CreateTechnicianScheduleDTO dto)
        {
            var createdDto = await _technicianScheduleService.Create(dto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = createdDto
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTechnicianSchedule(string id, [FromBody] UpdateTechnicianScheduleDTO dto)
        {
            var updatedDto = await _technicianScheduleService.Update(id, dto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = updatedDto
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
                Data = null
            });
        }

        [HttpGet("technician/{technicianId}")]
        public async Task<IActionResult> GetTechnicianSchedulesByTechnicianId(
             string technicianId,
             DateTime fromDate,
             DateTime toDate)
        {
            var schedules = await _technicianScheduleService.GetTechnicianSchedulesByTechnicianId(technicianId, fromDate, toDate);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = schedules
            });
        }

        [HttpGet("Range")]
        public async Task<IActionResult> GetTechnicianSchedulesByRange(
            DateTime fromDate,
            DateTime toDate)
        {
            var schedules = await _technicianScheduleService.GetTechnicianSchedulesByRange(fromDate, toDate);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = schedules
            });
        }

        [HttpGet("room/{laboratoryRoomId}")]
        public async Task<IActionResult> GetTechnicianSchedulesByLaboratoryRoom(
            string laboratoryRoomId,
            DateTime fromDate,
            DateTime toDate)
        {
            var schedules = await _technicianScheduleService.GetTechnicianSchedulesByLaboratoryRoom(laboratoryRoomId, fromDate, toDate);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = schedules
            });
        }
    }
}
