using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.ServiceRepositories
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public ServiceRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<Service> FindByIdAsync(string id)
        {
            return await _context.Services
                .Include(s => s.LaboratoryRooms)
                .FirstOrDefaultAsync(s => s.Id == id);
        }
        public async Task<Service> FindByRoomAsync(string roomId)
        {
            return await _context.Services
                .Include(s => s.LaboratoryRooms)
                .FirstOrDefaultAsync(s => s.LaboratoryRoomsId == roomId);
        }

        public async Task<(List<Service> Services, int TotalItems)> FindAll(
            string? laboratoryRoomId,
            string? name,
            decimal? minPrice,
            decimal? maxPrice,
            string? description,
            int pageNumber,
            int pageSize)
        {
            var query = _context.Services
                .Include(s => s.LaboratoryRooms)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(laboratoryRoomId))
            {
                query = query.Where(s => s.LaboratoryRoomsId == laboratoryRoomId);
            }
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(s => s.Name.Contains(name));
            }
            if (minPrice.HasValue)
            {
                query = query.Where(s => s.Price >= minPrice.Value);
            }
            if (maxPrice.HasValue)
            {
                query = query.Where(s => s.Price <= maxPrice.Value);
            }
            if (!string.IsNullOrWhiteSpace(description))
            {
                query = query.Where(s => s.Description.Contains(description));
            }

            var totalItems = await query.CountAsync();
            var services = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (services, totalItems);
        }
        public async Task<bool> ExistsByNameAsync(string name, string laboratoryRoomId)
        {
            return await _context.Services.AnyAsync(s =>
                s.Name.ToLower().Trim() == name.ToLower().Trim() &&
                s.LaboratoryRoomsId == laboratoryRoomId);
        }

        public async Task InsertAsync(Service service)
        {
            await _context.Services.AddAsync(service);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Service service)
        {
            _context.Services.Update(service);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Service service)
        {
            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
        }
    }
}