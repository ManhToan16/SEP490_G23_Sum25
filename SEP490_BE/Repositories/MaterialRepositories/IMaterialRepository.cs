using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.MaterialRepositories
{
    public interface IMaterialRepository
    {
        Task<Material> FindByIdAsync(string id);
        Task AddAsync(Material material);
        Task UpdateAsync(Material material);
        Task DeleteAsync(Material material);
        Task<List<Material>> FindAll();
        Task<bool> IsMaterialExistsAsync(string name, string categoryId, string supplierId);
    }
}
