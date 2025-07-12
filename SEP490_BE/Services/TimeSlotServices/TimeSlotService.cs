using SEP490_BE.DTO.SupplierDTO;
using SEP490_BE.DTO.TimeSlotDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.SupplierRepositories;
using SEP490_BE.Repositories.TimeSlotRepositories;

namespace SEP490_BE.Services.TimeSlotServices
{
    public class TimeSlotService : ITimeSlotService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly ITimeSlotRepository _timeSlotRepository;

        public TimeSlotService(KhanhAnNeurologyClinicContext context, ITimeSlotRepository timeSlotRepository)
        {
            _context = context;
            _timeSlotRepository = timeSlotRepository;
        }
        public async Task<TimeSlotResponseDTO> GetTimeSlotById(string id)
        {
            var timeSlot = await _timeSlotRepository.FindByIdAsync(id);
            if (timeSlot == null)
            {
                throw new ResourceNotFoundException("Không thấy khoảng thời gian.");
            }

            return await MapToResponseDTO(timeSlot);
        }

        public async Task<List<TimeSlotResponseDTO>> GetAllTimeSlots()
        {
            var suppliers = await _timeSlotRepository.GetAllAsync();
            var tasks = suppliers.Select(MapToResponseDTO);
            var results = await Task.WhenAll(tasks);
            return results.ToList();
        }

        private async Task<TimeSlotResponseDTO> MapToResponseDTO(TimeSlot timeSlot)
        {
            return new TimeSlotResponseDTO
            {
                Id = timeSlot.Id,
                Name = timeSlot.Name,
                StartTime = timeSlot.StartTime,
                EndTime = timeSlot.EndTime,
                Description = timeSlot.Description
            };
        }
    }
}
