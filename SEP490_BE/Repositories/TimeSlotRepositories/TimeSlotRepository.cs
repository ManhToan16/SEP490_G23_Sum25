using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.TimeSlotRepositories
{
    public class TimeSlotRepository : ITimeSlotRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public TimeSlotRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<TimeSlot> FindByIdAsync(string id)
        {
            return await _context.TimeSlots.FindAsync(id);
        }
        public async Task<List<TimeSlot>> GetAllAsync()
        {
            return await _context.TimeSlots.ToListAsync();
        }
    }
}
