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
        Task<VisitResponseDTO> MarkAsComplete(string id);
        Task<VisitResponseDTO> Calling(string id);
        Task<VisitResponseDTO> GetByAppointmentId(string appointmentId);

    }
}
