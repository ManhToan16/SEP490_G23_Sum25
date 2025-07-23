using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.ScheduleChangeRepositories
{
    public class ScheduleChangeRepository : IScheduleChangeRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public ScheduleChangeRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<ScheduleChangeRequest> FindByIdAsync(string id)
        {
            return await _context.ScheduleChangeRequests
                .Include(r => r.Requester)
                .Include(r => r.TargetUser).Include(r => r.RequesterSchedule)
        .Include(r => r.TargetSchedule)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task AddAsync(ScheduleChangeRequest request)
        {
            await _context.ScheduleChangeRequests.AddAsync(request);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ScheduleChangeRequest request)
        {
            _context.ScheduleChangeRequests.Update(request);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var request = await FindByIdAsync(id);
            if (request != null)
            {
                _context.ScheduleChangeRequests.Remove(request);
                await _context.SaveChangesAsync();
            }
        }
        public async Task DeleteByScheduleAsync(string requesterId, string scheduleId, DateTime date, string timeSlotId)
        {
            var requestsToDelete = await _context.ScheduleChangeRequests
                .Include(r => r.RequesterSchedule)
                .Where(r =>
                    r.RequesterId == requesterId &&
                    r.RequesterScheduleId == scheduleId &&
                    r.RequesterSchedule != null &&
                    r.RequesterSchedule.Date == date &&
                    r.RequesterSchedule.TimeSlotId == timeSlotId
                ).ToListAsync();

            _context.ScheduleChangeRequests.RemoveRange(requestsToDelete);
            await _context.SaveChangesAsync();
        }
        public async Task<List<ScheduleChangeRequest>> GetByRequesterIdAsync(string requesterId)
        {
            return await _context.ScheduleChangeRequests
                .Include(r => r.Requester)
                .Include(r => r.TargetUser)
                .Include(r => r.RequesterSchedule)
        .Include(r => r.TargetSchedule)
                .Where(r => r.RequesterId == requesterId)
                .ToListAsync();
        }
        public async Task<List<ScheduleChangeRequest>> GetByTargetUserIdAsync(string targetUserId)
        {
            return await _context.ScheduleChangeRequests
                .Include(r => r.Requester)
                .Include(r => r.TargetUser)
                .Include(r => r.RequesterSchedule)
        .Include(r => r.TargetSchedule)
                .Where(r => r.TargetUserId == targetUserId)
                .ToListAsync();
        }

    }
}
