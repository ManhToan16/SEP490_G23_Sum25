using SEP490_BE.DTO;
using SEP490_BE.DTO.ExaminationRoomDTO;

namespace SEP490_BE.Services.ExaminationRoomServices
{
    public interface IExaminationRoomService
    {
        Task<Pagination<ExaminationRoomResponseDTO>> GetAll(
            string? name,
            string? description,
            int pageNumber,
            int pageSize);
        Task<ExaminationRoomResponseDTO> GetById(string id);
        Task<ExaminationRoomResponseDTO> Create(CreateExaminationRoomDTO request);
        Task<ExaminationRoomResponseDTO> Update(string id, UpdateExaminationRoomDTO request);
        Task Delete(string id);
    }
}
