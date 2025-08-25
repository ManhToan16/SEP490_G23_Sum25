using Microsoft.AspNetCore.SignalR;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO.ScheduleDTO;

namespace SEP490_BE.Hubs
{
    public class KhanhAnHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var role = Context.GetHttpContext()?.Request.Query["role"];
            if (!string.IsNullOrEmpty(role))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, role);
            }
            await base.OnConnectedAsync();
        }
    }
}
