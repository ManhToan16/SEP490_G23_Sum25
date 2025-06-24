using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.ExaminationRoomRepositories
{
    public interface IExaminationRoomRepository
    {
        Task<ExaminationRoom> FindByIdAsync(string id);
        Task<(List<ExaminationRoom> Rooms, int TotalItems)> FindAll(
            string? name,
            string? description,
            int pageNumber,
            int pageSize);
        Task InsertAsync(ExaminationRoom room);
        Task UpdateAsync(ExaminationRoom room);
        Task DeleteAsync(ExaminationRoom room);
    }
}
