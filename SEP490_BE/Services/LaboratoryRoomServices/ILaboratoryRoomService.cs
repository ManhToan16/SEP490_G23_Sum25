using SEP490_BE.DTO;

namespace SEP490_BE.Services.LaboratoryRoomServices
{
    public interface ILaboratoryRoomService
    {
        Task<Pagination<LaboratoryRoomResponseDTO>> GetAll(
            string? name,
            string? description,
            int pageNumber,
            int pageSize);
        Task<LaboratoryRoomResponseDTO> GetById(string id);
        Task<LaboratoryRoomResponseDTO> Create(CreateLaboratoryRoomDTO request);
        Task<LaboratoryRoomResponseDTO> Update(string id, UpdateLaboratoryRoomDTO request);
        Task Delete(string id);
    }
}
