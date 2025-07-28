using Microsoft.EntityFrameworkCore;
using SEP490_BE.DTO.SupplierDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.SupplierRepositories;

namespace SEP490_BE.Services.SupplierServices
{
    public class SupplierService : ISupplierService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly ISupplierRepository _supplierRepository;

        public SupplierService(KhanhAnNeurologyClinicContext context, ISupplierRepository supplierRepository)
        {
            _context = context;
            _supplierRepository = supplierRepository;
        }

        public async Task<SupplierResponseDTO> CreateSupplier(CreateSupplierDTO request)
        {
            var isExists = await _supplierRepository.IsSupplierExistsAsync(request.Name, request.Email);
            if (isExists)
                throw new InvalidOperationException("Nhà cung cấp đã tồn tại.");
            var supplier = new Supplier
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                Address = request.Address,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow
            };
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _supplierRepository.AddAsync(supplier);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return await MapToResponseDTO(supplier);
        }
        public async Task<bool> IsSupplierExistsAsync(string name, string email)
        {
            return await _context.Suppliers
                .AnyAsync(s => s.Name == name || s.Email == email);
        }

        public async Task<SupplierResponseDTO> UpdateSupplier(string id, UpdateSupplierDTO request)
        {

            var supplier = await _supplierRepository.FindByIdAsync(id);
            if (supplier == null)
            {
                throw new ResourceNotFoundException("Nhà cung cấp không tồn tại.");
            }


            supplier.Name = request.Name ?? supplier.Name;
            supplier.PhoneNumber = request.PhoneNumber ?? supplier.PhoneNumber;
            supplier.Email = request.Email ?? supplier.Email;
            supplier.Address = request.Address ?? supplier.Address;
            supplier.Description = request.Description ?? supplier.Description;
            supplier.UpdatedAt = DateTime.UtcNow;
            var isExists = await _supplierRepository.IsSupplierExistsAsync(supplier.Name, supplier.Email);
            if (isExists)
            {
                throw new InvalidOperationException("Nhà cung cấp đã tồn tại.");
            }
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _supplierRepository.UpdateAsync(supplier);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return await MapToResponseDTO(supplier);

        }

        public async Task DeleteSupplier(string id)
        {
            var supplier = await _supplierRepository.FindByIdAsync(id);
            if (supplier == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy nhà cung cấp.");
            }

            await _supplierRepository.DeleteAsync(supplier);
            await _context.SaveChangesAsync();
        }

        public async Task<SupplierResponseDTO> GetSupplierById(string id)
        {
            var supplier = await _supplierRepository.FindByIdAsync(id);
            if (supplier == null)
            {
                throw new ResourceNotFoundException("Nhà cung cấp không tồn tại.");
            }

            return await MapToResponseDTO(supplier);
        }

        public async Task<List<SupplierResponseDTO>> GetAllSuppliers()
        {
            var suppliers = await _supplierRepository.GetAllAsync();
            var tasks = suppliers.Select(MapToResponseDTO);
            var results = await Task.WhenAll(tasks);
            return results.ToList(); 
        }

        private async Task<SupplierResponseDTO> MapToResponseDTO(Supplier supplier)
        {
            return new SupplierResponseDTO
            {
                Id = supplier.Id,
                Name = supplier.Name,
                PhoneNumber = supplier.PhoneNumber,
                Email = supplier.Email,
                Address = supplier.Address,
                Description = supplier.Description,
                CreatedAt = supplier.CreatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss"),
                UpdatedAt = supplier.UpdatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss")
            };
        }
    }
}
