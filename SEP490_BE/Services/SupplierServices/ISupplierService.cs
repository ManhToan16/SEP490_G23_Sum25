using SEP490_BE.DTO.SupplierDTO;

namespace SEP490_BE.Services.SupplierServices
{
    public interface ISupplierService
    {
        Task<SupplierResponseDTO> CreateSupplier(CreateSupplierDTO request);
        Task<SupplierResponseDTO> UpdateSupplier(string id, UpdateSupplierDTO request);
        Task DeleteSupplier(string id);
        Task<SupplierResponseDTO> GetSupplierById(string id);
        Task<List<SupplierResponseDTO>> GetAllSuppliers();
    }
}
