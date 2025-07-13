using SEP490_BE.DTO.CategoryDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.CategoryRepositories;
using Microsoft.EntityFrameworkCore;

namespace SEP490_BE.Services.CategoryServices
{
    public class CategoryService : ICategoryService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(KhanhAnNeurologyClinicContext context, ICategoryRepository categoryRepository)
        {
            _context = context;
            _categoryRepository = categoryRepository;
        }

        public async Task<CategoryResponseDTO> CreateCategory(CreateCategoryDTO request)
        {

            var category = new Category
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _categoryRepository.AddAsync(category);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw ;
            }
            return MapToResponseDTO(category);

        }

        public async Task<CategoryResponseDTO> UpdateCategory(string id, UpdateCategoryDTO request)
        {           
            var category = await _categoryRepository.FindByIdAsync(id);
            if (category == null)
            {
                throw new ResourceNotFoundException("Danh mục không tồn tại.");
            }

            category.Name = request.Name ?? category.Name;
            category.Description = request.Description ?? category.Description;
            category.UpdatedAt = DateTime.UtcNow;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _categoryRepository.UpdateAsync(category);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return MapToResponseDTO(category);

        }

        public async Task DeleteCategory(string id)
        {
         var category = await _categoryRepository.FindByIdAsync(id);
            if (category == null)
            {
                throw new ResourceNotFoundException("Danh mục không tồn tại.");
            }

            await _categoryRepository.DeleteAsync(category);
            await _context.SaveChangesAsync();

        }

        public async Task<CategoryResponseDTO> GetCategoryById(string id)
        {
            var category = await _categoryRepository.FindByIdAsync(id);
            if (category == null)
            {
                throw new ResourceNotFoundException("Danh mục không tồn tại.");
            }

            return MapToResponseDTO(category);
        }

        public async Task<Pagination<CategoryResponseDTO>> GetAllCategories(string? name, string? description, int pageNumber , int pageSize )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var (categories, totalItems) = await _categoryRepository.FindAll(name, description, pageNumber, pageSize);
            var responseDtos = categories.Select(MapToResponseDTO).ToList();
            return new Pagination<CategoryResponseDTO>
            {
                Items = responseDtos,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        private CategoryResponseDTO MapToResponseDTO(Category category)
        {
            return new CategoryResponseDTO
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                CreatedAt = category.CreatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss"),
                UpdatedAt = category.UpdatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss")
            };
        }

    }
}
