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
            var data = dto != null ? new List<object> { dto } : new List<object>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = data
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateDoctorSchedule([FromBody] CreateDoctorScheduleDTO dto)
        {
            var createdDto = await _doctorScheduleService.Create(dto);
            var data = createdDto != null ? new List<object> { createdDto } : new List<object>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = data
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctorSchedule(string id, [FromBody] UpdateDoctorScheduleDTO dto)
        {
            var updatedDto = await _doctorScheduleService.Update(id, dto);
            var data = updatedDto != null ? new List<object> { updatedDto } : new List<object>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = data
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
                Data = new List<object>()
            });
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetDoctorSchedulesByDoctorId(
             string doctorId,
             DateTime fromDate,
             DateTime toDate)
        {
            var schedules = await _doctorScheduleService.GetDoctorSchedulesByDoctorId(doctorId, fromDate, toDate);
            var data = schedules?.ToList() ?? new List<DoctorScheduleResponseDTO>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = data 
            });
        }

        [HttpGet("Range")]
        public async Task<IActionResult> GetDoctorSchedulesByRange(
            DateTime fromDate,
            DateTime toDate)
        {
            var schedules = await _doctorScheduleService.GetDoctorSchedulesByRange(fromDate, toDate);
            var data = schedules?.ToList() ?? new List<DoctorScheduleResponseDTO>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = data 
            });
        }

        [HttpGet("room/{examinationRoomId}")]
        public async Task<IActionResult> GetDoctorSchedulesByExaminationRoom(
            string examinationRoomId,
            DateTime fromDate,
            DateTime toDate)
        {
            var schedules = await _doctorScheduleService.GetDoctorSchedulesByExaminationRoom(examinationRoomId, fromDate, toDate);
            var data = schedules?.ToList() ?? new List<DoctorScheduleResponseDTO>();
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
