using SEP490_BE.DTO.MaterialDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.MaterialRepositories;
using Microsoft.EntityFrameworkCore;

namespace SEP490_BE.Services.MaterialServices
{
    public class MaterialService : IMaterialService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IMaterialRepository _materialRepository;

        public MaterialService(KhanhAnNeurologyClinicContext context, IMaterialRepository materialRepository)
        {
            _context = context;
            _materialRepository = materialRepository;
        }

        public async Task<MaterialResponseDTO> CreateMaterial(CreateMaterialDTO request)
        { 

            var category = await _context.Categories.FindAsync(request.CategoryId);
            if (category == null)
            {
                throw new ResourceNotFoundException("Danh mục không tồn tại.");
            }

            var supplier = await _context.Suppliers.FindAsync(request.SupplierId);
            if (supplier == null)
            {
                throw new ResourceNotFoundException("Nhà cung cấp không tồn tại.");
            }
            if (request.MinQuantity.HasValue && request.MaxQuantity.HasValue)
            {
                if (request.MinQuantity > request.MaxQuantity)
                {
                    throw new InvalidOperationException("Số lượng tối thiểu không được lớn hơn số lượng tối đa.");
                }
            }
            if (await IsMaterialExistsAsync(request.Name, request.CategoryId, request.SupplierId))
            {
                throw new InvalidOperationException("Vật tư đã tồn tại.");
            }
            var material = new Material
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                CategoryId = request.CategoryId,
                SupplierId = request.SupplierId,
                Unit = request.Unit,
                QuantityInStock = request.QuantityInStock,
                MaxQuantity = request.MaxQuantity,
                MinQuantity = request.MinQuantity,
                CreatedAt = DateTime.UtcNow
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _materialRepository.AddAsync(material);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch 
            {
                await transaction.RollbackAsync();
                throw ;
            }
            return MapToResponseDTO(material);

        }
        public async Task<bool> IsMaterialExistsAsync(string name, string categoryId, string supplierId)
        {
            return await _context.Materials.AnyAsync(m =>
                m.Name.ToLower() == name.ToLower().Trim() &&
                m.CategoryId == categoryId &&
                m.SupplierId == supplierId);
        }

        public async Task<MaterialResponseDTO> UpdateMaterial(string id, UpdateMaterialDTO request)
        {
           
            var material = await _materialRepository.FindByIdAsync(id);
            if (material == null)
            {
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            }

            if (!string.IsNullOrEmpty(request.CategoryId))
            {
                var category = await _context.Categories.FindAsync(request.CategoryId);
                if (category == null)
                {
                    throw new ResourceNotFoundException("Danh mục không tồn tại.");
                }
                material.CategoryId = request.CategoryId;
            }
            if (request.MinQuantity.HasValue && request.MaxQuantity.HasValue)
            {
                if (request.MinQuantity > request.MaxQuantity)
                {
                    throw new InvalidOperationException("Số lượng tối thiểu không được lớn hơn số lượng tối đa.");
                }
            }
            if (!string.IsNullOrEmpty(request.SupplierId))
            {
                var supplier = await _context.Suppliers.FindAsync(request.SupplierId);
                if (supplier == null)
                {
                    throw new ResourceNotFoundException("Nhà cung cấp không tồn tại.");
                }
                material.SupplierId = request.SupplierId;
            }

            material.Name = request.Name ?? material.Name;
            material.Unit = request.Unit ?? material.Unit;
            material.QuantityInStock = request.QuantityInStock ?? material.QuantityInStock;
            material.MaxQuantity = request.MaxQuantity ?? material.MaxQuantity;
            material.MinQuantity = request.MinQuantity ?? material.MinQuantity;
            material.UpdatedAt = DateTime.UtcNow;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _materialRepository.UpdateAsync(material);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw ;
            }
            return MapToResponseDTO(material);

        }

        public async Task DeleteMaterial(string id)
        {         
            var material = await _materialRepository.FindByIdAsync(id);
            if (material == null)
            {
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            }
            await _materialRepository.DeleteAsync(material);
            await _context.SaveChangesAsync();

        }

        public async Task<MaterialResponseDTO> GetMaterialById(string id)
        {
            var material = await _materialRepository.FindByIdAsync(id);
            if (material == null)
            {
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            }

            return MapToResponseDTO(material);
        }

        public async Task<Pagination<MaterialResponseDTO>> GetAllMaterials(string? name, string? categoryId, string? supplierId, int pageNumber = 1, int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var (materials, totalItems) = await _materialRepository.FindAll(name, categoryId, supplierId, pageNumber, pageSize);
            var responseDtos = materials.Select(MapToResponseDTO).ToList();
            return new Pagination<MaterialResponseDTO>
            {
                Items = responseDtos,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        private MaterialResponseDTO MapToResponseDTO(Material material)
        {
            return new MaterialResponseDTO
            {
                Id = material.Id,
                Name = material.Name,
                CategoryId = material.CategoryId,
                CategoryName = material.Category?.Name,
                SupplierId = material.SupplierId,
                SupplierName = material.Supplier?.Name,
                Unit = material.Unit,
                QuantityInStock = material.QuantityInStock,
                MaxQuantity = material.MaxQuantity,
                MinQuantity = material.MinQuantity,
                CreatedAt = material.CreatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss"),
                UpdatedAt = material.UpdatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss")
            };
        }
    }
}
