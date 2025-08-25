using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Hubs;

namespace SEP490_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationHubService _notificationService;

        public NotificationsController(INotificationHubService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("{role}")]
        public IActionResult GetNotifications(string role)
        {
            var notis = _notificationService.GetNotifications(role);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { notis }
            });
            //return Ok(notis);
        }
    }
}
