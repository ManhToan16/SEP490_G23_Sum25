using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.TimeSlotRepositories
{
    public interface ITimeSlotRepository
    {
        Task<TimeSlot> FindByIdAsync(string id);
        Task<List<TimeSlot>> GetAllAsync();
    }
}
