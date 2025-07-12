using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.MedicineRepositories
{
    public class MedicineRepository : IMedicineRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public MedicineRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<Medicine> FindByIdAsync(string id)
        {
            return await _context.Medicines.FindAsync(id);
        }

        public async Task AddAsync(Medicine medicine)
        {
            await _context.Medicines.AddAsync(medicine);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Medicine medicine)
        {
            _context.Medicines.Update(medicine);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Medicine medicine)
        {
                _context.Medicines.Remove(medicine);
                await _context.SaveChangesAsync();          
        }

        public async Task<(List<Medicine> Medicines, int TotalItems)> FindAll(string? name, string? description, int pageNumber, int pageSize)
        {
            var query = _context.Medicines.AsQueryable();

            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(m => m.Name.Contains(name));
            }

            if (!string.IsNullOrEmpty(description))
            {
                query = query.Where(m => m.Description.Contains(description));
            }

            int totalItems = await query.CountAsync();

            var medicines = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (medicines, totalItems);
        }
    }
}
