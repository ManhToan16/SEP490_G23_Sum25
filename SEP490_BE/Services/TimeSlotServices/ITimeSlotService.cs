using SEP490_BE.DTO.SupplierDTO;
using SEP490_BE.DTO.TimeSlotDTO;

namespace SEP490_BE.Services.TimeSlotServices
{
    public interface ITimeSlotService
    {
        Task<TimeSlotResponseDTO> GetTimeSlotById(string id);
        Task<List<TimeSlotResponseDTO>> GetAllTimeSlots();
    }
}
