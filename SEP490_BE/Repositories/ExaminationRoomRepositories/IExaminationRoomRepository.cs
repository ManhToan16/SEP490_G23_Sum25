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
        //Task<List<Queue>> GetPatientsInRoomAsync(string roomId); 
        //Task<(List<Queue> Queues, DoctorProfile Doctor)> GetPatientsAndDoctorInRoomAsync(string roomId, DateTime date); 
        //Task<DoctorProfile> GetDoctorInRoomAsync(string roomId, DateTime date); 
    }
}
