using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.ServiceRepositories
{
    public interface IServiceRepository
    {
        Task<Service> FindByIdAsync(string id);
        Task<Service> FindByRoomAsync(string roomId);
        Task<List<Service>> FindAllByRoomAsync(string roomId);

        Task<(List<Service> Services, int TotalItems)> FindAll(
            string? laboratoryRoomId,
            string? name,
            decimal? minPrice,
            decimal? maxPrice,
            string? description,
            int pageNumber,
            int pageSize);
        Task InsertAsync(Service service);
        Task UpdateAsync(Service service);
        Task DeleteAsync(Service service);
        Task<bool> ExistsByNameAsync(string name, string laboratoryRoomId);
    }
}
