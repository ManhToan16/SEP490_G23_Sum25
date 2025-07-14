using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.MaterialRepositories
{
    public interface IMaterialRepository
    {
        Task<Material> FindByIdAsync(string id);
        Task AddAsync(Material material);
        Task UpdateAsync(Material material);
        Task DeleteAsync(Material material);
        Task<(List<Material> Materials, int TotalItems)> FindAll(string? name, string? categoryId, string? supplierId, int pageNumber, int pageSize);
    }
}
