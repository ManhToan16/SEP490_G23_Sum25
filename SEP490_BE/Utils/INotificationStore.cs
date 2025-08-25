namespace SEP490_BE.Utils
{
    public interface INotificationStore
    {
        void AddNotification(string role, object notification);
        List<object> GetNotifications(string role);
    }
}
