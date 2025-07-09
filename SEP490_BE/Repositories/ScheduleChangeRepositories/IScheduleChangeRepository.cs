using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.ScheduleChangeRepositories
{
    public interface IScheduleChangeRepository
    {
        Task<ScheduleChangeRequest> FindByIdAsync(string id);
        Task AddAsync(ScheduleChangeRequest request);
        Task UpdateAsync(ScheduleChangeRequest request);
        Task DeleteAsync(string id);
    }
}
