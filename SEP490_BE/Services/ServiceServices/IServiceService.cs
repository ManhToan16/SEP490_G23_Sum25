using SEP490_BE.DTO.ServiceDTO;
using SEP490_BE.DTO;

namespace SEP490_BE.Services.ServiceServices
{
    public interface IServiceService
    {
        Task<Pagination<ServiceResponseDTO>> GetAll(
            string? laboratoryRoomId,
            string? name,
            decimal? minPrice,
            decimal? maxPrice,
            string? description,
            int pageNumber,
            int pageSize);
        Task<ServiceResponseDTO> GetById(string id);
        Task<ServiceResponseDTO> GetByRoom(string roomId);
        Task<ServiceResponseDTO> Create(CreateServiceDTO request);
        Task<ServiceResponseDTO> Update(string id, UpdateServiceDTO request);
        Task Delete(string id);
    }
}
