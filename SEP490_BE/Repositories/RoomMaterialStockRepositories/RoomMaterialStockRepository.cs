using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.RoomMaterialStockRepositories
{
    public class RoomMaterialStockRepository : IRoomMaterialStockRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public RoomMaterialStockRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<RoomMaterialStock?> GetByRoomAndMaterialAsync(string roomId, string materialId)
        {
            return await _context.RoomMaterialStocks
                .FirstOrDefaultAsync(rms => rms.RoomId == roomId && rms.MaterialId == materialId);
        }

        public async Task<List<RoomMaterialStock>> GetAllByRoomAsync(string roomId)
        {
            return await _context.RoomMaterialStocks
                .Where(rms => rms.RoomId == roomId)
                .ToListAsync();
        }

        public async Task AddAsync(RoomMaterialStock entity)
        {
            await _context.RoomMaterialStocks.AddAsync(entity);
        }

        public async Task UpdateAsync(RoomMaterialStock entity)
        {
            _context.RoomMaterialStocks.Update(entity);
        }

        public async Task DeleteAsync(RoomMaterialStock entity)
        {
            _context.RoomMaterialStocks.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
