using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Services.NotificationServices;

namespace SEP490_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("{role}")]
        public IActionResult GetNotifications(string role)
        {
            var notis = _notificationService.GetNotifications(role);
            return Ok(notis);
        }
    }
}
