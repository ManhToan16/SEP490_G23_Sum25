using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.TechinicianScheduleRepositories
{
    public class TechnicianScheduleRepository : ITechnicianScheduleRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public TechnicianScheduleRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<TechnicianSchedule> FindByIdAsync(string id)
        {
            return await _context.TechnicianSchedules
                .Include(ts => ts.Technician)
                .Include(ts => ts.LaboratoryRoom)
                .FirstOrDefaultAsync(ts => ts.Id == id);
        }

        public async Task<TechnicianSchedule> FindByTechnicianIdAndDateAsync(string technicianId, DateTime date)
        {
            return await _context.TechnicianSchedules
                .FirstOrDefaultAsync(ts => ts.TechnicianId == technicianId && ts.Date.Date == date.Date);
        }

        public async Task<(List<TechnicianSchedule> Schedules, int TotalItems)> FindAll(
            string? technicianId,
            DateTime? date,
            int pageNumber,
            int pageSize)
        {
            var query = _context.TechnicianSchedules
                .Include(ts => ts.Technician)
                .Include(ts => ts.LaboratoryRoom)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(technicianId))
            {
                query = query.Where(ts => ts.TechnicianId == technicianId);
            }
            if (date.HasValue)
            {
                query = query.Where(ts => ts.Date.Date == date.Value.Date);
            }

            var totalItems = await query.CountAsync();
            var schedules = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (schedules, totalItems);
        }

        public async Task InsertAsync(TechnicianSchedule schedule)
        {
            await _context.TechnicianSchedules.AddAsync(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(TechnicianSchedule schedule)
        {
            _context.TechnicianSchedules.Update(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(TechnicianSchedule schedule)
        {
            _context.TechnicianSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task<TechnicianSchedule> FindByRoomAndDateAsync(string laboratoryRoomId, DateTime date)
        {
            return await _context.TechnicianSchedules
                .FirstOrDefaultAsync(ts => ts.LaboratoryRoomId == laboratoryRoomId && ts.Date.Date == date.Date);
        }
    }
}
