using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.ScheduleRepositories
{
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public ScheduleRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<List<Schedule>> GetSchedulesByUserAndDateRangeAsync(string userId, DateTime? fromDate, DateTime? toDate)
        {
            return await _context.Schedules
                .Include(s => s.User)
                .Where(s => s.UserId == userId &&
                            (!fromDate.HasValue || s.Date >= fromDate.Value.Date) &&
                            (!toDate.HasValue || s.Date <= toDate.Value.Date))
                .ToListAsync();
        }
        public async Task<bool> AnyScheduleUsingRoomAsync(string roomId, string roomType)
        {
            return await _context.Schedules
                .AnyAsync(s => s.RoomId == roomId && s.RoomType == roomType);
        }
        public async Task<List<Schedule>> GetSchedulesByRoomAndDateRangeAsync(string roomId, DateTime? fromDate, DateTime? toDate)
        {
         
            return await _context.Schedules
                .Include(s => s.User)
                .Where(s => s.RoomId == roomId && (!fromDate.HasValue || s.Date >= fromDate.Value.Date) && (!toDate.HasValue || s.Date <= toDate.Value.Date))
                .ToListAsync();
        }

        public async Task<List<Schedule>> GetAllSchedulesByDateRangeAsync(DateTime? fromDate, DateTime? toDate)
        {
            return await _context.Schedules
                .Include(s => s.User)
                .Where(s =>
                    (!fromDate.HasValue || s.Date >= fromDate.Value.Date) &&
                    (!toDate.HasValue || s.Date <= toDate.Value.Date)
                )
                .ToListAsync();
        }

        public async Task<List<Schedule>> GetSchedulesByRoleAndDateRangeAsync(string role, DateTime? fromDate, DateTime? toDate)
        {
            return await _context.Schedules
                .Include(s => s.User)
                .Where(s => s.Role == role && (!fromDate.HasValue || s.Date >= fromDate.Value.Date) &&
                            (!toDate.HasValue || s.Date <= toDate.Value.Date))
                .ToListAsync();
        }

        public async Task InsertRangeAsync(List<Schedule> schedules)
        {
            await _context.Schedules.AddRangeAsync(schedules);
            await _context.SaveChangesAsync();
        }

        public async Task<Schedule> FindByIdAsync(string id)
        {
            return await _context.Schedules
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<bool> CheckScheduleConflictAsync(string userId, DateTime date)
        {
            return await _context.Schedules
                .AnyAsync(s => s.UserId == userId && s.Date.Date == date.Date);
        }
        public async Task<Schedule> CreateAsync(Schedule schedule)
        {
            _context.Schedules.Add(schedule);
            await _context.SaveChangesAsync();
            return schedule;
        }
        public async Task UpdateAsync(Schedule schedule)
        {
            _context.Schedules.Update(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var schedule = await _context.Schedules.FindAsync(id);
            if (schedule != null)
            {
                _context.Schedules.Remove(schedule);
                await _context.SaveChangesAsync();
            }
        }
    }
}
