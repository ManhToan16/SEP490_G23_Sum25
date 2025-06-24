using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.DTO.DoctorScheduleDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.DoctorScheduleServices;
using SEP490_BE.Constants;

namespace SEP490_BE.Controllers
{
    [Route("api/Doctor/Schedules")]
    [ApiController]
    public class DoctorSchedulesController : ControllerBase
    {
        private readonly IDoctorScheduleService _doctorScheduleService;

        public DoctorSchedulesController(IDoctorScheduleService doctorScheduleService)
        {
            _doctorScheduleService = doctorScheduleService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDoctorSchedule(string id)
        {
            var dto = await _doctorScheduleService.GetById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = dto
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateDoctorSchedule([FromBody] CreateDoctorScheduleDTO dto)
        {
            var createdDto = await _doctorScheduleService.Create(dto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = createdDto
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctorSchedule(string id, [FromBody] UpdateDoctorScheduleDTO dto)
        {
            var updatedDto = await _doctorScheduleService.Update(id, dto);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = updatedDto
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctorSchedule(string id)
        {
            await _doctorScheduleService.Delete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDoctorSchedules(
            string? doctorId = null,
            DateTime? date = null,
            bool? isAvailable = null,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var pagination = await _doctorScheduleService.GetAll(doctorId, date, isAvailable, pageNumber, pageSize);
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
