using SEP490_BE.DTO.MaterialDTO;
using SEP490_BE.DTO;

namespace SEP490_BE.Services.MaterialServices
{
    public interface IMaterialService
    {
        Task<MaterialResponseDTO> CreateMaterial(CreateMaterialDTO request);
        Task<MaterialResponseDTO> UpdateMaterial(string id, UpdateMaterialDTO request);
        Task DeleteMaterial(string id);
        Task<MaterialResponseDTO> GetMaterialById(string id);
        Task<List<MaterialResponseDTO>> GetAllMaterials();
    }
}
