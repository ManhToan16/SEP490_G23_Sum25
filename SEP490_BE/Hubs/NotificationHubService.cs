using Microsoft.AspNetCore.SignalR;
using SEP490_BE.DTO.CategoryDTO;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO.ExaminationRoomDTO;
using SEP490_BE.DTO.LaboratoryRoomDTO;
using SEP490_BE.DTO.MedicineDTO;
using SEP490_BE.DTO.ScheduleChangeDTO;
using SEP490_BE.DTO.ScheduleDTO;
using SEP490_BE.DTO.ServiceDTO;
using SEP490_BE.DTO.SupplierDTO;
using SEP490_BE.DTO.TransactionDTO;
using SEP490_BE.Entities;

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
        public async Task SendSupplierUpdate(SupplierResponseDTO supplier)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveSupplierUpdate", supplier);
        }

        public async Task SendSupplierDelete(string supplierId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveSupplierDelete", supplierId);
        }
        public async Task SendMedicineUpdate(MedicineResponseDTO medicine)
        {
            await _hubContext.Clients.Group("ADMIN").SendAsync("ReceiveMedicineUpdate", medicine);
        }


        public async Task SendMedicineDelete(string medicineId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveMedicineDelete", medicineId);
        }

        public async Task SendCategoryUpdate(CategoryResponseDTO category)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveCategoryUpdate", category);
        }

        public async Task SendCategoryDelete(string cateId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveCategoryDelete", cateId);
        }
        public async Task SendLowStockAlert(ProvidedSummaryDTO summary)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveLowStockAlert", summary);
        }
        public async Task SendTransactionUpdate(TransactionResponseDTO transaction)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveTransactionUpdate", transaction);
        }
    }
}
