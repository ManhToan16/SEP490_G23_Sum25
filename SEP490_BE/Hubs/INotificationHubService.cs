using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO.ExaminationRoomDTO;
using SEP490_BE.DTO.LaboratoryRoomDTO;
using SEP490_BE.DTO.MedicineDTO;
using SEP490_BE.DTO.ScheduleChangeDTO;
using SEP490_BE.DTO.ScheduleDTO;
using SEP490_BE.DTO.ServiceDTO;
using SEP490_BE.DTO.SupplierDTO;

namespace SEP490_BE.Hubs
{
    public interface INotificationHubService
    {
        // DoctorProfile
        Task SendDoctorProfileUpdate(DoctorProfileResponseDTO doctorProfile);
        Task SendDoctorProfileDelete(string doctorProfileId);

        // Schedule
        Task SendScheduleUpdate(ScheduleResponseDTO schedule);
        Task SendScheduleDelete(string scheduleId);
        // ScheduleChangeRequest
        Task SendScheduleChangeUpdate(ScheduleChangeResponseDTO changeRequest);
        // ExaminationRoom
        Task SendExaminationRoomUpdate(ExaminationRoomResponseDTO room);
        Task SendExaminationRoomDelete(string roomId);
        // LaboratoryRoom
        Task SendLaboratoryRoomUpdate(LaboratoryRoomResponseDTO room);
        Task SendLaboratoryRoomDelete(string roomId);
        // Service
        Task SendServiceUpdate(ServiceResponseDTO service);
        Task SendServiceDelete(string serviceId);
        // Supplier
        Task SendSupplierUpdate(SupplierResponseDTO supplier);
        Task SendSupplierDelete(string supplierId);
        // Medicine
        Task SendMedicineUpdate(MedicineResponseDTO medicine);
        Task SendMedicineDelete(string medicineId);

    }
}
