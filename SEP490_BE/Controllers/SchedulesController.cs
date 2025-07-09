using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.ScheduleDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.ScheduleServices;
using Microsoft.AspNetCore.SignalR;
using SEP490_BE.Hubs;
using SEP490_BE.Entities;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesController : ControllerBase
    {
        private readonly IScheduleService _scheduleService;
        private readonly IHubContext<ScheduleHub> _hubContext;

        public SchedulesController(IScheduleService scheduleService, IHubContext<ScheduleHub> hubContext)
        {
            _scheduleService = scheduleService;
            _hubContext = hubContext;
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
        [Authorize(Roles = "ADMIN")]
        [HttpPost("range")]
        public async Task<IActionResult> CreateScheduleRange(
            [FromBody] CreateScheduleRangeDTO request)
        {          
            var schedules = await _scheduleService.CreateScheduleRange(request);
            foreach (var schedule in schedules)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveScheduleUpdate", schedule);
            }
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
            await _hubContext.Clients.All.SendAsync("ReceiveScheduleUpdate", schedule);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = schedule
            });
        }
        [HttpPut("{id}")]
        //[Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateSchedule(
            string id,
            [FromBody] UpdateScheduleDTO request)
        {
            //var adminId = User?.Identity?.Name;
            //if (string.IsNullOrEmpty(adminId))
            //{
            //    return Unauthorized(new ApiResponse
            //    {
            //        StatusCode = StatusCodes.Status401Unauthorized,
            //        Success = false,
            //        Message = "Admin authentication required.",
            //        Data = null
            //    });
            //}

            var schedule = await _scheduleService.UpdateSchedule(id, request);
            await _hubContext.Clients.All.SendAsync("ReceiveScheduleUpdate", schedule);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = schedule
            });
        }

        [HttpDelete("{id}")]
        //[Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteSchedule(string id)
        {
            //var adminId = User?.Identity?.Name;
            //if (string.IsNullOrEmpty(adminId))
            //{
            //    return Unauthorized(new ApiResponse
            //    {
            //        StatusCode = StatusCodes.Status401Unauthorized,
            //        Success = false,
            //        Message = "Admin authentication required.",
            //        Data = null
            //    });
            //}

            await _scheduleService.DeleteSchedule(id);
            await _hubContext.Clients.All.SendAsync("ReceiveScheduleDelete", id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }

    }
}
