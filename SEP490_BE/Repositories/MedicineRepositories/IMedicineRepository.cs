using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.MedicineRepositories
{
    public interface IMedicineRepository
    {
        Task<Medicine> FindByIdAsync(string id);
        Task AddAsync(Medicine medicine);
        Task UpdateAsync(Medicine medicine);
        Task DeleteAsync(Medicine medicine);
        Task<(List<Medicine> Medicines, int TotalItems)> FindAll(string? name, string? description, int pageNumber, int pageSize);
    }
}
