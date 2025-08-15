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
using OfficeOpenXml.Style;
using OfficeOpenXml;

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
        public async Task<IActionResult> ImportAndCreateScheduleRange(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File Excel không hợp lệ.");

         
                // Đọc file, bên trong ReadScheduleExcelAsync đã tự tìm UserId + Role theo DoctorName
                var assignments = await _scheduleService.ReadScheduleExcelAsync(file);

                // Gộp dữ liệu để tạo theo range
                var dto = new CreateScheduleRangeDTO
                {
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

        [HttpGet("download-template")]
        public async Task<IActionResult> DownloadScheduleTemplate()
        {
            try
            {
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("ScheduleTemplate");

                // Header
                worksheet.Cells[1, 1].Value = "Date";
                worksheet.Cells[1, 2].Value = "RoomName";
                worksheet.Cells[1, 3].Value = "TimeSlotId";
                worksheet.Cells[1, 4].Value = "DoctorName";

                // Ví dụ dữ liệu mẫu
                worksheet.Cells[2, 1].Value = "08/05/2025";
                worksheet.Cells[2, 2].Value = "Phòng Khám Tổng Quát C";
                worksheet.Cells[2, 3].Value = "TS001";
                worksheet.Cells[2, 4].Value = "Nguyễn Văn A";

                worksheet.Cells[3, 1].Value = "08/05/2025";
                worksheet.Cells[3, 2].Value = "Phòng Khám Tổng Quát C";
                worksheet.Cells[3, 3].Value = "TS002";
                worksheet.Cells[3, 4].Value = "Nguyễn Văn A";

                // Format header
                using (var range = worksheet.Cells[1, 1, 1, 4])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                }

                // Format Date column
                worksheet.Column(1).Style.Numberformat.Format = "dd/MM/yyyy";

                // Auto fit
                worksheet.Cells.AutoFitColumns();

                var excelBytes = await package.GetAsByteArrayAsync();

                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "ScheduleTemplate.xlsx");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi tạo template Excel: {ex.Message}");
            }
        }


    }
}
