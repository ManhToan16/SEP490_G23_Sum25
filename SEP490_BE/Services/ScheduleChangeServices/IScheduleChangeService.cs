using SEP490_BE.DTO.ScheduleChangeDTO;

namespace SEP490_BE.Services.ScheduleChangeServices
{
    public interface IScheduleChangeService
    {
        Task<ScheduleChangeResponseDTO> CreateRequest(string requesterId, CreateScheduleChangeDTO request);
        Task<ScheduleChangeResponseDTO> ApproveRequest(string requestId);
        Task<ScheduleChangeResponseDTO> RejectRequest(string requestId);
        Task<ScheduleChangeResponseDTO> GetRequestById(string requestId);
    }
}
