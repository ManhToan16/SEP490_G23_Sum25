using SEP490_BE.DTO;
using SEP490_BE.DTO.VisitDTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Services.VisitServices
{
    public interface IVisitService
    {
        Task<VisitResponseDTO> Create(VisitRequestDTO request);
        Task<Pagination<VisitResponseDTO>> GetVisits(
                string examinationRoomId,
                string? status,
                DateTime date,
                int pageNumber,
                int pageSize);
        Task<VisitResponseDTO> GetById(string id);
        Task<VisitResponseDTO> UpdateStatus(string id, string status);
        Task MarkAsComplete(string id);
        Task Calling(string id);

    }
}
