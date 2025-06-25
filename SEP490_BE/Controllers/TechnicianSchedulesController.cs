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

        [HttpGet]
        public async Task<IActionResult> GetAllTechnicianSchedules(
            string? technicianId = null,
            DateTime? date = null,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var pagination = await _technicianScheduleService.GetAll(technicianId, date, pageNumber, pageSize);
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
