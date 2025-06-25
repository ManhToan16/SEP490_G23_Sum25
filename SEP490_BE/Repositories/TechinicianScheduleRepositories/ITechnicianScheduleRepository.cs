using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.TechinicianScheduleRepositories
{
    public interface ITechnicianScheduleRepository
    {
        Task<TechnicianSchedule> FindByIdAsync(string id);
        Task<TechnicianSchedule> FindByTechnicianIdAndDateAsync(string technicianId, DateTime date);
        Task<(List<TechnicianSchedule> Schedules, int TotalItems)> FindAll(
            string? technicianId,
            DateTime? date,
            int pageNumber,
            int pageSize);
        Task InsertAsync(TechnicianSchedule schedule);
        Task UpdateAsync(TechnicianSchedule schedule);
        Task DeleteAsync(TechnicianSchedule schedule);
        Task<TechnicianSchedule> FindByRoomAndDateAsync(string laboratoryRoomId, DateTime date); // Kiểm tra trùng phòng và ngày
    }
}
