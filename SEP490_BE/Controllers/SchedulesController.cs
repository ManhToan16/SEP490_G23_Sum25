using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.ScheduleDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.ScheduleServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesController : ControllerBase
    {
        private readonly IScheduleService _scheduleService;

        public SchedulesController(IScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetSchedulesByUserId(
            string userId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            var schedules = await _scheduleService.GetSchedulesByUserId(userId, fromDate, toDate);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = schedules
            });
        }

        [HttpGet("room/{roomId}")]
        public async Task<IActionResult> GetSchedulesByRoomId(
            string roomId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            var schedules = await _scheduleService.GetSchedulesByRoomId(roomId, fromDate, toDate);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = schedules
            });
        }

        [HttpGet("range")]
        public async Task<IActionResult> GetAllSchedules(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            var schedules = await _scheduleService.GetAllSchedules(fromDate, toDate);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = schedules
            });
        }

        [HttpPost("range")]
        //[Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateScheduleRange(
            [FromBody] CreateScheduleRangeDTO request)
        {
          
            var schedules = await _scheduleService.CreateScheduleRange(request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = schedules
            });
        }
        [HttpPost]
        //[Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateSchedule(
           [FromBody] CreateScheduleDTO request)
        {
          

            var schedule = await _scheduleService.CreateSchedule(request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = schedule
            });
        }

    }
}
