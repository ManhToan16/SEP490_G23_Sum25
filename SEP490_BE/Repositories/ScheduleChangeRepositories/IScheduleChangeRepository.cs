using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.ScheduleChangeRepositories
{
    public interface IScheduleChangeRepository
    {
        Task<ScheduleChangeRequest> FindByIdAsync(string id);
        Task AddAsync(ScheduleChangeRequest request);
        Task UpdateAsync(ScheduleChangeRequest request);
        Task DeleteAsync(string id);
        Task DeleteByScheduleAsync(string requesterId, string scheduleId, DateTime date, string timeSlotId);
        Task<List<ScheduleChangeRequest>> GetByRequesterIdAsync(string requesterId);
        Task<List<ScheduleChangeRequest>> GetByTargetUserIdAsync(string targetUserId);
    }
}
