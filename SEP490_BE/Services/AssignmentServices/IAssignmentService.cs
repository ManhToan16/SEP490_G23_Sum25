using SEP490_BE.DTO.AssignmentDTO;

namespace SEP490_BE.Services.AssignmentServices
{
    public interface IAssignmentService
    {
        Task<(List<AssignmentResponseDTO> Assignments, int TotalItems)> GetAssignments(string laboratoryRoomId, string? status, DateTime date, int pageNumber, int pageSize);
        Task<AssignmentResponseDTO> GetById(string id);
        Task<List<AssignmentResponseDTO>> CreateRange(List<AssignmentRequestDTO> requests);
        Task<List<AssignmentResponseDTO>> GetByVisitId(string visitId);
        Task UpdateStatus(string id, string status);
        Task Calling(string id);
        Task MarkAsCompleted(string id);
    }
}
