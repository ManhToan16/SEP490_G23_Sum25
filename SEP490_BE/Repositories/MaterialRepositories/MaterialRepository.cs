using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.MaterialRepositories
{
    public class MaterialRepository : IMaterialRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public MaterialRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<Material> FindByIdAsync(string id)
        {
            return await _context.Materials
                .Include(m => m.Category)
                .Include(m => m.Supplier)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task AddAsync(Material material)
        {
            await _context.Materials.AddAsync(material);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Material material)
        {
            _context.Materials.Update(material);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Material material)
        {
                _context.Materials.Remove(material);
                await _context.SaveChangesAsync();
            
        }
        public async Task<bool> IsMaterialExistsAsync(string name, string categoryId, string supplierId)
        {
            return await _context.Materials.AnyAsync(m =>
                m.Name.ToLower() == name.ToLower().Trim() &&
                m.CategoryId == categoryId &&
                m.SupplierId == supplierId);
        }
        public async Task<(List<Material> Materials, int TotalItems)> FindAll(string? name, string? categoryId, string? supplierId, int pageNumber, int pageSize)
        {
            var query = _context.Materials
                .Include(m => m.Category)
                .Include(m => m.Supplier)
                .AsQueryable();

            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(m => m.Name.Contains(name));
            }

            if (!string.IsNullOrEmpty(categoryId))
            {
                query = query.Where(m => m.CategoryId == categoryId);
            }

            if (!string.IsNullOrEmpty(supplierId))
            {
                query = query.Where(m => m.SupplierId == supplierId);
            }

            int totalItems = await query.CountAsync();

            var materials = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (materials, totalItems);
        }
    }
}
