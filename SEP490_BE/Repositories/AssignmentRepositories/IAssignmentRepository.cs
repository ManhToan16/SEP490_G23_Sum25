using SEP490_BE.DTO.AssignmentDTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.AssignmentRepositories
{
    public interface IAssignmentRepository
    {
        Task Insert(Assignment assignment);
        Task Update(Assignment assignment);
        Task<Assignment?> FindById(string id);
        Task<List<Assignment>> GetByVisitId(string visitId);
        Task<(List<AssignmentResponseDTO> Assignments, int TotalItems)> GetAssignments(
            string laboratoryRoomId,
            string? status,
            DateTime date,
            int pageNumber,
            int pageSize);
    }
}
