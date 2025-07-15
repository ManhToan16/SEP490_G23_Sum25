using SEP490_BE.DTO;
using SEP490_BE.DTO.AssignmentDTO;

namespace SEP490_BE.Services.AssignmentServices
{
    public interface IAssignmentService
    {
        Task<Pagination<AssignmentResponseDTO>> GetAssignments(string laboratoryRoomId, string? status, DateTime date, int pageNumber, int pageSize);
        Task<AssignmentResponseDTO> GetById(string id);
        Task<List<AssignmentResponseDTO>> CreateRange(string visitId, List<AssignmentRequestDTO> requests);
        Task<List<AssignmentResponseDTO>> GetByVisitId(string visitId);
        Task<AssignmentResponseDTO> Calling(string id);
        Task<AssignmentResponseDTO> MarkAsCompleted(string id);
    }
}
