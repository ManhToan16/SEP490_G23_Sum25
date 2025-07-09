using Microsoft.AspNetCore.SignalR;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO.ScheduleDTO;

namespace SEP490_BE.Hubs
{
    public class ScheduleHub : Hub
    {
        public async Task SendScheduleUpdate(ScheduleResponseDTO schedule)
        {
            await Clients.All.SendAsync("ReceiveScheduleUpdate", schedule);
        }

        public async Task SendScheduleDelete(string scheduleId)
        {
            await Clients.All.SendAsync("ReceiveScheduleDelete", scheduleId);
        }
        public async Task SendDoctorProfileUpdate(DoctorProfileResponseDTO doctorProfile)
        {
            await Clients.All.SendAsync("ReceiveDoctorProfileUpdate", doctorProfile);
        }

        public async Task SendDoctorProfileDelete(string doctorProfileId)
        {
            await Clients.All.SendAsync("ReceiveDoctorProfileDelete", doctorProfileId);
        }
    }
}
