namespace SEP490_BE.Services.NotificationServices
{
    public interface INotificationService
    {
        Task NotifyRoleAsync(string role, string title, string message);
        List<object> GetNotifications(string role);
    }
}
