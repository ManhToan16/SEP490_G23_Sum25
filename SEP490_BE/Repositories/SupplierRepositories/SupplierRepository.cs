using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.SupplierRepositories
{
    public class SupplierRepository : ISupplierRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public SupplierRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<Supplier> FindByIdAsync(string id)
        {
            return await _context.Suppliers.FindAsync(id);
        }

        public async Task AddAsync(Supplier supplier)
        {
            await _context.Suppliers.AddAsync(supplier);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Supplier supplier)
        {
            _context.Suppliers.Update(supplier);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Supplier supplier)
        {
                _context.Suppliers.Remove(supplier);
                await _context.SaveChangesAsync();
        }

        public async Task<List<Supplier>> GetAllAsync()
        {
            return await _context.Suppliers.ToListAsync();
        }
        public async Task<bool> IsSupplierExistsAsync(string name, string email)
        {
            return await _context.Suppliers
                .AnyAsync(s => s.Name == name || s.Email == email);
        }
        }
}
