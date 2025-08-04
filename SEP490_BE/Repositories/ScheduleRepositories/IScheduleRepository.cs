using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.ScheduleRepositories
{
    public interface IScheduleRepository
    {
        Task<List<Schedule>> GetSchedulesByUserAndDateRangeAsync(string userId, DateTime? fromDate, DateTime? toDate);
        Task<List<Schedule>> GetSchedulesByRoomAndDateRangeAsync(string roomId, DateTime? fromDate, DateTime? toDate);
        Task<List<Schedule>> GetSchedulesByRoleAndDateRangeAsync(string role, DateTime? fromDate, DateTime? toDate);

        Task<List<Schedule>> GetAllSchedulesByDateRangeAsync(DateTime? fromDate, DateTime? toDate);
        Task InsertRangeAsync(List<Schedule> schedules);
        Task<Schedule> FindByIdAsync(string id);
        Task<bool> CheckScheduleConflictAsync(string userId, DateTime date);
        Task<Schedule> CreateAsync(Schedule schedule);
        Task UpdateAsync(Schedule schedule);
        Task DeleteAsync(string id);
        Task<bool> AnyScheduleUsingRoomAsync(string roomId, string roomType);

    }
}
