using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.LaboratoryRoomRepositories
{
    public interface ILaboratoryRoomRepository
    {
        Task<LaboratoryRoom> FindByIdAsync(string id);
        Task<(List<LaboratoryRoom> Rooms, int TotalItems)> FindAll(
            string? name,
            string? description,
            int pageNumber,
            int pageSize);
        Task<List<LaboratoryRoom>> GetActiveRoomsAsync();
        Task InsertAsync(LaboratoryRoom room);
        Task UpdateAsync(LaboratoryRoom room);
        Task DeleteAsync(LaboratoryRoom room);
        Task<bool> ExistsByNameAsync(string name);

    }
}
