using SEP490_BE.DTO.VisitDTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.VisitRepositories
{
    public interface IVisitRepository
    {
        Task<List<Visit>> GetVisitsForCalling(string examinationRoomId, DateTime date);
        Task Insert(Visit visit);
        Task Update(Visit visit);
        Task<Visit?> FindById(string id);
        Task<(List<VisitResponseDTO> Visits, int TotalItems)> GetVisits(
                string examinationRoomId,
                string? status,
                DateTime date,
                int pageNumber,
                int pageSize);

    }
}
