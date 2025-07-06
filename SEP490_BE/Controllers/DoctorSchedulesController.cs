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
                Data = new[] { dto }
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
                Data = new[] { createdDto }
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
                Data = new[] { updatedDto }
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

        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetDoctorSchedulesByDoctorId(
            string doctorId,
            DateTime fromDate,
            DateTime toDate)
        {         

            var schedules = await _doctorScheduleService.GetDoctorSchedulesByDoctorId(doctorId, fromDate, toDate);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = schedules 
            });
        }

        [HttpGet("Range")]
        public async Task<IActionResult> GetDoctorSchedulesByRange(
            DateTime fromDate,
            DateTime toDate)
        {

            var schedules = await _doctorScheduleService.GetDoctorSchedulesByRange(fromDate, toDate);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = schedules
            });
        }

        [HttpGet("room/{examinationRoomId}")]
        public async Task<IActionResult> GetDoctorSchedulesByExaminationRoom(
           string examinationRoomId,
           DateTime fromDate,
           DateTime toDate) 
        {         

            var schedules = await _doctorScheduleService.GetDoctorSchedulesByExaminationRoom(examinationRoomId, fromDate, toDate);
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
