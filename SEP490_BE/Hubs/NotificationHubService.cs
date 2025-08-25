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
using StackExchange.Redis;
using System;
using System.Text.Json;
using static System.Collections.Specialized.BitVector32;

namespace SEP490_BE.Hubs
{
    public class NotificationHubService : INotificationHubService
    {
        private readonly IHubContext<KhanhAnHub> _hubContext;
        private readonly IDatabase _redisDb;
        public NotificationHubService(
        IHubContext<KhanhAnHub> hubContext,
        IConnectionMultiplexer redis)
        {
            _hubContext = hubContext;
            _redisDb = redis.GetDatabase();
        }

        public async Task SendDoctorProfileUpdate(DoctorProfileResponseDTO doctorProfile)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveDoctorProfileUpdate", doctorProfile);
        }

        public async Task SendDoctorProfileDelete(string doctorProfileId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveDoctorProfileDelete", doctorProfileId);
        }
        public async Task SendScheduleUpdate(ScheduleResponseDTO schedule, string action)
        {
            string message = action switch
            {
                "Create" => $"Vừa thêm lịch mới cho {schedule.UserName}",
                "Update" => $"Vừa cập nhật lịch mới cho {schedule.UserName}",               
                _ => $"Dịch vụ {schedule.UserName} có thay đổi"
            };

            var notification = new
            {
                Type = "SCHEDULE",
                Action = action,
                Data = schedule,
                Message = message,
                CreatedAt = DateTime.UtcNow
            };

            var json = JsonSerializer.Serialize(notification);

            await _redisDb.ListLeftPushAsync("Notifications:ADMIN", json);
            await _redisDb.ListTrimAsync("Notifications:ADMIN", 0, 49);

            await _hubContext.Clients.Group("ADMIN")
                .SendAsync("ReceiveScheduleUpdate", notification);
        }

        public async Task SendScheduleDelete(string scheduleId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveScheduleDelete", scheduleId);
        }
        public async Task SendScheduleChangeUpdate(ScheduleChangeResponseDTO changeRequest)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveScheduleChangeRequest", changeRequest);
        }
        public async Task SendExaminationRoomUpdate(ExaminationRoomResponseDTO room, string action)
        {
            string message = action switch
            {
                "Create" => $"Vừa thêm phòng lâm sàng mới {room.Name}",
                "Update" => $"Vừa cập nhật phòng lâm sàng {room.Name}",
                "Delete" => $"Vừa xóa dịch vụ {room.Name}",
                _ => $"Dịch vụ {room.Name} có thay đổi"
            };

            var notification = new
            {
                Type = "EXAMINATION_ROOM",
                Action = action,
                Data = room,
                Message = message,
                CreatedAt = DateTime.UtcNow
            };

            var json = JsonSerializer.Serialize(notification);

            await _redisDb.ListLeftPushAsync("Notifications:ADMIN", json);
            await _redisDb.ListTrimAsync("Notifications:ADMIN", 0, 49);

            await _hubContext.Clients.Group("ADMIN")
                .SendAsync("ReceiveExaminationRoomUpdate", notification);
        }

        public async Task SendExaminationRoomDelete(string roomId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveExaminationRoomDelete", roomId);
        }
        public async Task SendLaboratoryRoomUpdate(LaboratoryRoomResponseDTO room,string action)
        {
            string message = action switch
            {
                "Create" => $"Vừa thêm phòng xét nghiệm mới {room.Name}",
                "Update" => $"Vừa cập nhật phòng xét nghiệm {room.Name}",
                "Delete" => $"Vừa xóa dịch vụ {room.Name}",
                _ => $"Dịch vụ {room.Name} có thay đổi"
            };

            var notification = new
            {
                Type = "LABORATORY_ROOM",
                Action = action,
                Data = room,
                Message = message,
                CreatedAt = DateTime.UtcNow
            };

            var json = JsonSerializer.Serialize(notification);

            await _redisDb.ListLeftPushAsync("Notifications:ADMIN", json);
            await _redisDb.ListTrimAsync("Notifications:ADMIN", 0, 49);

            await _hubContext.Clients.Group("ADMIN")
                .SendAsync("ReceiveLaboratoryRoomUpdate", notification);
        }

        public async Task SendLaboratoryRoomDelete(string roomId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveLaboratoryRoomDelete", roomId);
        }
        public async Task SendServiceUpdate(ServiceResponseDTO service,string action)
        {
            string message = action switch
            {
                "Create" => $"Vừa thêm dịch vụ mới {service.Name}",
                "Update" => $"Vừa cập nhật dịch vụ {service.Name}",
                "Delete" => $"Vừa xóa dịch vụ {service.Name}",
                _ => $"Dịch vụ {service.Name} có thay đổi"
            };

            var notification = new
            {
                Type = "SERVICE",
                Action = action,
                Data = service,
                Message = message,
                CreatedAt = DateTime.UtcNow
            };

            var json = JsonSerializer.Serialize(notification);

            await _redisDb.ListLeftPushAsync("Notifications:ADMIN", json);
            await _redisDb.ListTrimAsync("Notifications:ADMIN", 0, 49);

            await _hubContext.Clients.Group("ADMIN")
                .SendAsync("ReceiveServiceUpdate", notification);
        }

        public async Task SendServiceDelete(string serviceId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveServiceDelete", serviceId);
        }
        public async Task SendSupplierUpdate(SupplierResponseDTO supplier, string action)
        {
            string message = action switch
            {
                "Create" => $"Vừa thêm nhà cung cấp {supplier.Name}",
                "Update" => $"Vừa cập nhật nhà cung cấp {supplier.Name}",
                "Delete" => $"Vừa xóa nhà cung cấp {supplier.Name}",
                _ => $"Nhà cung cấp {supplier.Name} có thay đổi"
            };

            var notification = new
            {
                Type = "SUPPLIER",
                Action = action,
                Data = supplier,
                Message = message,
                CreatedAt = DateTime.UtcNow
            };

            var json = JsonSerializer.Serialize(notification);

            await _redisDb.ListLeftPushAsync("Notifications:ADMIN", json);
            await _redisDb.ListTrimAsync("Notifications:ADMIN", 0, 49);

            await _hubContext.Clients.Group("ADMIN")
                .SendAsync("ReceiveSupplierUpdate", notification);
        }


        public async Task SendSupplierDelete(string supplierId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveSupplierDelete", supplierId);
        }
        public async Task SendMedicineUpdate(MedicineResponseDTO medicine, string action)
        {
            string message = action switch
            {
                "Create" => $"Vừa tạo mới thuốc {medicine.Name}",
                "Update" => $"Vừa cập nhật thuốc {medicine.Name}",
                "Delete" => $"Vừa xóa thuốc {medicine.Name}",
                _ => $"Thuốc {medicine.Name} có thay đổi"
            };
            var notification = new
            {
                Type = "MEDICINE",
                Action = action, 
                Data = medicine,
                Message = message,
                CreatedAt = DateTime.UtcNow
            };

            var json = JsonSerializer.Serialize(notification);

            // Lưu vào Redis
            await _redisDb.ListLeftPushAsync("Notifications:ADMIN", json);
            await _redisDb.ListTrimAsync("Notifications:ADMIN", 0, 49);

            // Gửi realtime qua SignalR
            await _hubContext.Clients.Group("ADMIN")
                .SendAsync("ReceiveMedicineUpdate", notification);
        }



        public async Task SendMedicineDelete(string medicineId)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveMedicineDelete", medicineId);
        }

        public async Task SendLowStockAlert(ProvidedSummaryDTO summary)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveLowStockAlert", summary);
        }
        public async Task SendTransactionUpdate(TransactionResponseDTO transaction)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveTransactionUpdate", transaction);
        }
        public async Task<List<object>> GetNotifications(string role)
        {
            var values = await _redisDb.ListRangeAsync($"Notifications:{role}", 0, 49);
            return values
                .Select(v => JsonSerializer.Deserialize<object>(v!))
                .ToList();
        }
    }
}
