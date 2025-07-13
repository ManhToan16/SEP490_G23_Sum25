using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.CategoryRepositories
{
    public interface ICategoryRepository
    {
        Task<Category> FindByIdAsync(string id);
        Task AddAsync(Category category);
        Task UpdateAsync(Category category);
        Task DeleteAsync(Category category);
        Task<(List<Category> Categories, int TotalItems)> FindAll(string? name, string? description, int pageNumber, int pageSize);
    }
}
