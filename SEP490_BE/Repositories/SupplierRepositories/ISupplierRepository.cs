using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.SupplierRepositories
{
    public interface ISupplierRepository
    {
        Task<Supplier> FindByIdAsync(string id);
        Task AddAsync(Supplier supplier);
        Task UpdateAsync(Supplier supplier);
        Task DeleteAsync(Supplier supplier);
        Task<List<Supplier>> GetAllAsync();
    }
}
