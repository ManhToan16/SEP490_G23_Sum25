using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.RoomMaterialStockRepositories
{
    public interface IRoomMaterialStockRepository
    {
        Task<RoomMaterialStock?> GetByRoomAndMaterialAsync(string roomId, string materialId);
        Task<List<RoomMaterialStock>> GetAllByRoomAsync(string roomId);
        Task AddAsync(RoomMaterialStock entity);
        Task UpdateAsync(RoomMaterialStock entity);
        Task DeleteAsync(RoomMaterialStock entity);
        Task SaveChangesAsync();
    }

}
