using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.CategoryRepositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public CategoryRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<Category> FindByIdAsync(string id)
        {
            return await _context.Categories.FindAsync(id);
        }

        public async Task AddAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Category category)
        {
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Category category)
        {          
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();            
        }

        public async Task<(List<Category> Categories, int TotalItems)> FindAll(string? name, string? description, int pageNumber, int pageSize)
        {
            var query = _context.Categories.AsQueryable();

            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(c => c.Name.Contains(name));
            }

            if (!string.IsNullOrEmpty(description))
            {
                query = query.Where(c => c.Description.Contains(description));
            }

            int totalItems = await query.CountAsync();

            var categories = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (categories, totalItems);
        }
    }
}
