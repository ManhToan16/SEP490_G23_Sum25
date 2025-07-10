using Microsoft.AspNetCore.SignalR;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO.ExaminationRoomDTO;
using SEP490_BE.DTO.LaboratoryRoomDTO;
using SEP490_BE.DTO.ScheduleChangeDTO;
using SEP490_BE.DTO.ScheduleDTO;
using SEP490_BE.DTO.ServiceDTO;

namespace SEP490_BE.Hubs
{
    public class NotificationHubService : INotificationHubService
    {
        private readonly IHubContext<KhanhAnHub> _hubContext;

        public NotificationHubService(IHubContext<KhanhAnHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendDoctorProfileUpdate(DoctorProfileResponseDTO doctorProfile)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveDoctorProfileUpdate", doctorProfile);
        }

        public async Task SendDoctorProfileDelete(string doctorProfileId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveDoctorProfileDelete", doctorProfileId);
        }
        public async Task SendScheduleUpdate(ScheduleResponseDTO schedule)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveScheduleUpdate", schedule);
        }

        public async Task SendScheduleDelete(string scheduleId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveScheduleDelete", scheduleId);
        }
        public async Task SendScheduleChangeUpdate(ScheduleChangeResponseDTO changeRequest)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveScheduleChangeRequest", changeRequest);
        }
        public async Task SendExaminationRoomUpdate(ExaminationRoomResponseDTO room)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveExaminationRoomUpdate", room);
        }

        public async Task SendExaminationRoomDelete(string roomId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveExaminationRoomDelete", roomId);
        }
        public async Task SendLaboratoryRoomUpdate(LaboratoryRoomResponseDTO room)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveLaboratoryRoomUpdate", room);
        }

        public async Task SendLaboratoryRoomDelete(string roomId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveLaboratoryRoomDelete", roomId);
        }
        public async Task SendServiceUpdate(ServiceResponseDTO service)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveServiceUpdate", service);
        }

        public async Task SendServiceDelete(string serviceId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveServiceDelete", serviceId);
        }
    }
}
