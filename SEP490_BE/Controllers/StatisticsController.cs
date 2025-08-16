using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Services.StatisticServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticService _statisticsService;

        public StatisticsController(IStatisticService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        //[HttpGet("patients")]
        //public async Task<IActionResult> GetPatientStatistics(DateTime? fromDate, DateTime? toDate)
        //{
        //    return Ok(await _statisticsService.GetPatientStatisticsAsync(fromDate, toDate));
        //}

        [HttpGet("dashboard-overview")]
        public async Task<IActionResult> GetDashboardOverview()
        {
            return Ok(await _statisticsService.GetDashboardOverviewAsync());
        }

        [HttpGet("revenue-statistics")]
        public async Task<IActionResult> GetRevenueStatistics(DateTime? fromDate, DateTime? toDate)
        {
            return Ok(await _statisticsService.GetRevenueStatisticsAsync(fromDate, toDate));
        }

        [HttpGet("patient-statistics")]
        public async Task<IActionResult> GetPatientStatistics(DateTime? fromDate, DateTime? toDate)
        {
            return Ok(await _statisticsService.GetPatientStatisticsAsync(fromDate, toDate));
        }

        [HttpGet("appointment-statistics")]
        public async Task<IActionResult> GetAppointmentStatistics(DateTime? fromDate, DateTime? toDate)
        {
            return Ok(await _statisticsService.GetAppointmentStatisticsAsync(fromDate, toDate));
        }

        [HttpGet("staff-statistics")]
        public async Task<IActionResult> GetStaffStatistics()
        {
            return Ok(await _statisticsService.GetStaffStatisticsAsync());
        }

        [HttpGet("room-utilization")]
        public async Task<IActionResult> GetRoomUtilization(DateTime? date)
        {
            return Ok(await _statisticsService.GetRoomUtilizationAsync(date));
        }

        [HttpGet("schedules")]
        public async Task<IActionResult> GetScheduleStatistics(DateTime? fromDate, DateTime? toDate)
        {
            return Ok(await _statisticsService.GetScheduleStatisticsAsync(fromDate, toDate));
        }

        //[HttpGet("services")]
        //public async Task<IActionResult> GetServiceStatistics(DateTime? fromDate, DateTime? toDate)
        //{
        //    return Ok(await _statisticsService.GetServiceStatisticsAsync(fromDate, toDate));
        //}

        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventoryStatistics()
        {
            return Ok(await _statisticsService.GetInventoryStatisticsAsync());
        }
        [HttpGet("attendanceRate")]
        public async Task<IActionResult> GetAttendence(DateTime? fromDate, DateTime? toDate)
        {
            return Ok(await _statisticsService.GetDoctorAttendanceStatisticsAsync(fromDate, toDate));
        }
    }
}
