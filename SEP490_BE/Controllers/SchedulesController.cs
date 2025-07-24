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
using Microsoft.EntityFrameworkCore;
using SEP490_BE.Repositories.RoleRepositories;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesController : ControllerBase
    {
        private readonly IScheduleService _scheduleService;
        private readonly INotificationHubService _notificationHubService;
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IRoleRepository _roleRepository;

        public SchedulesController(
            IScheduleService scheduleService,
            INotificationHubService notificationHubService,
            KhanhAnNeurologyClinicContext context,IRoleRepository roleRepository)
        {
            _scheduleService = scheduleService;
            _notificationHubService = notificationHubService;
            _context = context;
            _roleRepository = roleRepository;
        }
        private (DateTime fromDate, DateTime toDate) GetCurrentWeekRange()
        {
            var today = DateTime.Today;
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var startOfWeek = today.AddDays(-diff).Date;
            var endOfWeek = startOfWeek.AddDays(6).Date;
            return (startOfWeek, endOfWeek);
        }


        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetSchedulesByUserId(
            string userId,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            var (from, to) = (fromDate, toDate) switch
            {
                (null, null) => GetCurrentWeekRange(),
                (null, _) or (_, null) => throw new Exceptions.ArgumentException("Cần nhập cả ngày bắt đầu và ngày kết thúc."),
                _ => (fromDate.Value, toDate.Value)
            };
            var schedules = await _scheduleService.GetSchedulesByUserId(userId, from, to);
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
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            var (from, to) = (fromDate, toDate) switch
            {
                (null, null) => GetCurrentWeekRange(),
                (null, _) or (_, null) => throw new Exceptions.ArgumentException("Cần nhập cả ngày bắt đầu và ngày kết thúc."),
                _ => (fromDate.Value, toDate.Value)
            };
            var schedules = await _scheduleService.GetSchedulesByRoomId(roomId, from, to);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = schedules
            });
        }
        [HttpGet("role/{roleName}")]
        public async Task<IActionResult> GetSchedulesByRole(
           string roleName,
           [FromQuery] DateTime? fromDate,
           [FromQuery] DateTime? toDate)
        {
            var (from, to) = (fromDate, toDate) switch
            {
                (null, null) => GetCurrentWeekRange(),
                (null, _) or (_, null) => throw new Exceptions.ArgumentException("Cần nhập cả ngày bắt đầu và ngày kết thúc."),
                _ => (fromDate.Value, toDate.Value)
            };
            var schedules = await _scheduleService.GetSchedulesByRole(roleName, from, to);
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
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            var (from, to) = (fromDate, toDate) switch
            {
                (null, null) => GetCurrentWeekRange(),
                (null, _) or (_, null) => throw new Exceptions.ArgumentException("Cần nhập cả ngày bắt đầu và ngày kết thúc."),
                _ => (fromDate.Value, toDate.Value)
            };
            var schedules = await _scheduleService.GetAllSchedules(from, to);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = schedules
            });
        }
        [HttpGet("statistics/{role}")]
        public async Task<IActionResult> GetScheduleStatistics(
          string role,
          [FromQuery] DateTime? fromDate,
          [FromQuery] DateTime? toDate)
        {
            var (from, to) = (fromDate, toDate) switch
            {
                (null, null) => GetCurrentWeekRange(),
                (null, _) or (_, null) => throw new Exceptions.ArgumentException("Cần nhập cả ngày bắt đầu và ngày kết thúc."),
                _ => (fromDate.Value, toDate.Value)
            };
            var statistics = await _scheduleService.GetScheduleStatisticsByRole(role, from, to);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = statistics
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
                await _notificationHubService.SendScheduleUpdate(schedule);
            }
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = schedules
            });
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        public async Task<IActionResult> CreateSchedule(
           [FromBody] CreateScheduleDTO request)
        {
            var schedule = await _scheduleService.CreateSchedule(request);
            await _notificationHubService.SendScheduleUpdate(schedule);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = schedule
            });
        }
        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSchedule(
            string id,
            [FromBody] UpdateScheduleDTO request)
        {
            var schedule = await _scheduleService.UpdateSchedule(id, request);
            await _notificationHubService.SendScheduleUpdate(schedule);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = schedule
            });
        }
        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
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
            await _notificationHubService.SendScheduleDelete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }
        [HttpPost("import-create")]
        public async Task<IActionResult> ImportAndCreateScheduleRange( IFormFile file,  string userId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File Excel không hợp lệ.");

            if (string.IsNullOrWhiteSpace(userId))
                return BadRequest("UserId không được để trống.");
            var roles = await _roleRepository.FindRolesByUser(userId);
            if (roles == null || !roles.Any())
                return BadRequest("Người dùng không có vai trò nào.");
            var role = roles.First();
            if (!(new[] { "DOCTOR", "TECHNICIAN","NURSE" }.Contains(role)))
                return BadRequest("Chỉ cho phép nhập lịch cho DOCTOR hoặc TECHNICIAN.");
            try
            {
                var assignments = await _scheduleService.ReadScheduleExcelAsync(file,role);

                var dto = new CreateScheduleRangeDTO
                {
                    UserId = userId,
                    ScheduleAssignments = assignments
                };

                var response = await _scheduleService.CreateScheduleRange(dto);

                return Ok(new
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = MessageConstants.GET_SUCCESS,
                    Data = response
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi tạo lịch từ Excel: {ex.Message}");
            }
        }


    }
}
