using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;
using SEP490_BE.Utils;

namespace SEP490_BE.Repositories.DoctorScheduleRepositories
{
    public class DoctorScheduleRepository : IDoctorScheduleRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public DoctorScheduleRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<DoctorSchedule> FindByIdAsync(string id)
        {
            return await _context.DoctorSchedules
                .Include(ds => ds.Doctor)
                .Include(ds => ds.ExaminationRoom)
                .FirstOrDefaultAsync(ds => ds.Id == id);
        }

        public async Task<DoctorSchedule> FindByDoctorIdAndDateAsync(string doctorId, DateTime date)
        {
            return await _context.DoctorSchedules
                .FirstOrDefaultAsync(ds => ds.DoctorId == doctorId && ds.Date == date);
        }

        public async Task<(List<DoctorSchedule> Schedules, int TotalItems)> FindAll(
            string? doctorId,
            DateTime? date,
            bool? isAvailable,
            int pageNumber,
            int pageSize)
        {
            var query = _context.DoctorSchedules
                .Include(ds => ds.Doctor)
                .Include(ds => ds.ExaminationRoom)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(doctorId))
            {
                query = query.Where(ds => ds.DoctorId == doctorId);
            }
            if (date.HasValue)
            {
                query = query.Where(ds => ds.Date == date.Value);
            }
            if (isAvailable.HasValue)
            {
                query = query.Where(ds => ds.IsAvailable == isAvailable.Value);
            }

            var totalItems = await query.CountAsync();
            var schedules = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (schedules, totalItems);
        }

        public async Task InsertAsync(DoctorSchedule schedule)
        {
            await _context.DoctorSchedules.AddAsync(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(DoctorSchedule schedule)
        {
            _context.DoctorSchedules.Update(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(DoctorSchedule schedule)
        {
            _context.DoctorSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
        }
    }
}
