using SEP490_BE.DTO;
using SEP490_BE.DTO.CategoryDTO;

namespace SEP490_BE.Services.CategoryServices
{
    public interface ICategoryService
    {
        Task<CategoryResponseDTO> CreateCategory(CreateCategoryDTO request);
        Task<CategoryResponseDTO> UpdateCategory(string id, UpdateCategoryDTO request);
        Task DeleteCategory(string id);
        Task<CategoryResponseDTO> GetCategoryById(string id);
        Task<Pagination<CategoryResponseDTO>> GetAllCategories(string? name, string? description, int pageNumber , int pageSize );
    }
}
