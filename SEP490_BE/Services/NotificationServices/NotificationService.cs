using Microsoft.AspNetCore.SignalR;
using SEP490_BE.Hubs;
using SEP490_BE.Utils;

namespace SEP490_BE.Services.NotificationServices
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<KhanhAnHub> _hubContext;
        private readonly INotificationStore _store;

        public NotificationService(IHubContext<KhanhAnHub> hubContext, INotificationStore store)
        {
            _hubContext = hubContext;
            _store = store;
        }

        public async Task NotifyRoleAsync(string role, string title, string message)
        {
            var notification = new
            {
                Title = title,
                Message = message,
                Time = DateTime.UtcNow
            };

            _store.AddNotification(role, notification);

            await _hubContext.Clients.Group(role).SendAsync("ReceiveNotification", notification);
        }

        public List<object> GetNotifications(string role)
        {
            return _store.GetNotifications(role);
        }
    }
}
