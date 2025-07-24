using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.ScheduleChangeDTO;
using SEP490_BE.Hubs;
using SEP490_BE.Services.ScheduleChangeServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduleChangeRequestsController : ControllerBase
    {
        private readonly IScheduleChangeService _scheduleChangeRequestService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationHubService _notificationHubService;

        public ScheduleChangeRequestsController(
            IScheduleChangeService scheduleChangeRequestService,
            INotificationHubService notificationHubService,
            IHttpContextAccessor httpContextAccessor)
        {
            _scheduleChangeRequestService = scheduleChangeRequestService;
            _notificationHubService = notificationHubService;
            _httpContextAccessor = httpContextAccessor;
        }


        [Authorize(Roles = RoleConstants.Doctor + "," + RoleConstants.Technician + "," + RoleConstants.Nurse)]
        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] CreateScheduleChangeDTO request)
        {
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value;
            var createdRequest = await _scheduleChangeRequestService.CreateRequest(userId, request);
            await _notificationHubService.SendScheduleChangeUpdate(createdRequest);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { createdRequest }
            });
        }
        [Authorize(Roles = RoleConstants.Doctor + "," + RoleConstants.Technician + "," + RoleConstants.Nurse)]
        [HttpPut("approve/{requestId}")]

        public async Task<IActionResult> ApproveRequest(string requestId)
        {

      
            var changeRequest = await _scheduleChangeRequestService.ApproveRequest(requestId);
            await _notificationHubService.SendScheduleChangeUpdate(changeRequest);

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { changeRequest }
            });
        }
        [Authorize(Roles = RoleConstants.Doctor + "," + RoleConstants.Technician + "," + RoleConstants.Nurse)]
        [HttpPut("reject/{requestId}")]
        public async Task<IActionResult> RejectRequest(string requestId)
        {

            var changeRequest = await _scheduleChangeRequestService.RejectRequest(requestId);
            await _notificationHubService.SendScheduleChangeUpdate(changeRequest);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { changeRequest }
            });
        }

        [HttpGet("{requestId}")]
        public async Task<IActionResult> GetRequestById(string requestId)
        {
            var changeRequest = await _scheduleChangeRequestService.GetRequestById(requestId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { changeRequest }
            });
        }
        [HttpGet("requester/{requesterId}")]
        public async Task<IActionResult> GetByRequesterId(string requesterId)
        {
            var changeRequest = await _scheduleChangeRequestService.GetByRequesterIdAsync(requesterId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { changeRequest }
            });
        }
        [HttpGet("target/{targetId}")]
        public async Task<IActionResult> GetByTargetUserId(string targetId)
        {
            var changeRequest = await _scheduleChangeRequestService.GetByTargetUserIdAsync(targetId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { changeRequest }
            });
        }
    }
}
