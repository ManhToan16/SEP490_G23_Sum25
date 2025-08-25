using System.Collections.Concurrent;

namespace SEP490_BE.Utils
{
    public class InMemoryNotificationStore: INotificationStore
    {
        private readonly ConcurrentDictionary<string, List<object>> _store = new();

        public void AddNotification(string role, object notification)
        {
            _store.AddOrUpdate(role,
                new List<object> { notification },
                (key, oldValue) =>
                {
                    oldValue.Insert(0, notification);
                    // giữ tối đa 50 thông báo mỗi role
                    return oldValue.Take(50).ToList();
                });
        }

        public List<object> GetNotifications(string role)
        {
            return _store.TryGetValue(role, out var notis)
                ? notis
                : new List<object>();
        }
    }
}
