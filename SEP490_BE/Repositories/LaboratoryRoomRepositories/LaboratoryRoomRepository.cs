using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.LaboratoryRoomRepositories
{
    public class LaboratoryRoomRepository : ILaboratoryRoomRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public LaboratoryRoomRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<LaboratoryRoom> FindByIdAsync(string id)
        {
            return await _context.LaboratoryRooms
                .FirstOrDefaultAsync(lr => lr.Id == id);
        }
        public async Task<bool> ExistsByNameAsync(string name)
        {
            return await _context.LaboratoryRooms.AnyAsync(x => x.Name == name);
        }
        public async Task<(List<LaboratoryRoom> Rooms, int TotalItems)> FindAll(
            string? name,
            string? description,
            int pageNumber,
            int pageSize)
        {
            var query = _context.LaboratoryRooms.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(lr => lr.Name.Contains(name));
            }
            if (!string.IsNullOrWhiteSpace(description))
            {
                query = query.Where(lr => lr.Description.Contains(description));
            }

            var totalItems = await query.CountAsync();
            var rooms = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (rooms, totalItems);
        }
        public async Task<List<LaboratoryRoom>> GetActiveRoomsAsync()
        {
            return await _context.LaboratoryRooms
                .Where(er => er.IsActive == true)
                .ToListAsync();
        }

        public async Task InsertAsync(LaboratoryRoom room)
        {
            await _context.LaboratoryRooms.AddAsync(room);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(LaboratoryRoom room)
        {
            _context.LaboratoryRooms.Update(room);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(LaboratoryRoom room)
        {
            _context.LaboratoryRooms.Remove(room);
            await _context.SaveChangesAsync();
        }
    }
}
