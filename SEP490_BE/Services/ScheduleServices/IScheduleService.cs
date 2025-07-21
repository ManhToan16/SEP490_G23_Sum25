using SEP490_BE.DTO.ScheduleDTO;

namespace SEP490_BE.Services.ScheduleServices
{
    public interface IScheduleService
    {
        Task<List<ScheduleResponseDTO>> GetSchedulesByUserId(string userId, DateTime fromDate, DateTime toDate);
        Task<List<ScheduleResponseDTO>> GetSchedulesByRoomId(string roomId, DateTime fromDate, DateTime toDate);
        Task<List<ScheduleResponseDTO>> GetSchedulesByRole(string role, DateTime fromDate, DateTime toDate);
        Task<List<ScheduleResponseDTO>> GetAllSchedules(DateTime fromDate, DateTime toDate);
        Task<List<ScheduleResponseDTO>> CreateScheduleRange(CreateScheduleRangeDTO request);
        Task<ScheduleResponseDTO> CreateSchedule(CreateScheduleDTO request);
        Task<ScheduleResponseDTO> UpdateSchedule(string id, UpdateScheduleDTO request);
        Task<ScheduleStatisticsDTO> GetScheduleStatisticsByRole(string role, DateTime fromDate, DateTime toDate);
        Task DeleteSchedule(string id);
    }
}
