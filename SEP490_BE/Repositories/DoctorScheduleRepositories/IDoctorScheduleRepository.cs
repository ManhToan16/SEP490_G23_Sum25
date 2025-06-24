using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.DoctorScheduleRepositories
{
    public interface IDoctorScheduleRepository
    {
        Task<DoctorSchedule> FindByIdAsync(string id);
        Task<DoctorSchedule> FindByDoctorIdAndDateAsync(string doctorId, DateTime date);
        Task<(List<DoctorSchedule> Schedules, int TotalItems)> FindAll(
            string? doctorId,
            DateTime? date,
            bool? isAvailable,
            int pageNumber,
            int pageSize);
        Task InsertAsync(DoctorSchedule schedule);
        Task UpdateAsync(DoctorSchedule schedule);
        Task DeleteAsync(DoctorSchedule schedule);
    }
}
