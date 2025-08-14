using SEP490_BE.DTO.StatisticsDTO;

namespace SEP490_BE.Services.StatisticServices
{
    public interface IStatisticService
    {
        //Task<PatientStatisticsDTO> GetPatientStatisticsAsync(DateTime? fromDate, DateTime? toDate);

        // Nhóm 2: Lịch hẹn & lịch làm việc
        Task<List<WorkScheduleStatDTO>> GetScheduleStatisticsAsync(DateTime? fromDate, DateTime? toDate);

        // Nhóm 4: Dịch vụ & kết quả khám
        //Task<ServiceStatisticsDTO> GetServiceStatisticsAsync(DateTime? fromDate, DateTime? toDate);

        // Nhóm 5: Kho vật tư & thuốc
        Task<InventoryStatisticsDTO> GetInventoryStatisticsAsync();
        Task<List<DoctorAttendanceStatDTO>> GetDoctorAttendanceStatisticsAsync(DateTime? fromDate, DateTime? toDate);
    }
}
