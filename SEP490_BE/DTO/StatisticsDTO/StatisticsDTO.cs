namespace SEP490_BE.DTO.StatisticsDTO
{
    public class PatientStatisticsDTO
    {
        public int TotalPatients { get; set; }
        public int NewPatients { get; set; }
        public int ActivePatients { get; set; }
        public double GrowthRate { get; set; }
    }

    public class WorkScheduleStatDTO
    {
        public DateTime Date { get; set; }
        public string TimeSlot { get; set; } // "08:00 - 12:00"
        public string DoctorName { get; set; }
        public string Status { get; set; } // SCHEDULED / PRESENT / ABSENT
        public string RoomType { get; set; }
        public string RoomName { get; set; }
    }
    public class ServiceStatisticsDTO
    {
        public int TotalServices { get; set; }
        public int CompletedServices { get; set; }
        public int PendingResults { get; set; }
    }

    public class InventoryStatisticsDTO
    {
        public int TotalMaterials { get; set; }
        public int LowStockMaterials { get; set; }
        public int TotalMedicines { get; set; }
        public int LowStockMedicines { get; set; }
    }
    public class DoctorAttendanceStatDTO
    {
        public string DoctorId { get; set; }
        public string DoctorName { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public int TotalSessions { get; set; }
        public int AbsentCount { get; set; }
        public int PresentCount { get; set; }
        public double AttendanceRate { get; set; } // %
    }

    // New DTOs for Dashboard
    public class DashboardOverviewDTO
    {
        public PatientStatisticsDTO PatientStats { get; set; }
        public AppointmentStatisticsDTO AppointmentStats { get; set; }
        public RevenueStatisticsDTO RevenueStats { get; set; }
        public StaffStatisticsDTO StaffStats { get; set; }
        public InventoryStatisticsDTO InventoryStats { get; set; }
        public List<RecentActivityDTO> RecentActivities { get; set; }
        public List<SystemAlertDTO> SystemAlerts { get; set; }
    }

    public class RevenueStatisticsDTO
    {
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public decimal WeeklyRevenue { get; set; }
        public decimal DailyRevenue { get; set; }
        public double GrowthRate { get; set; }
        public decimal AverageRevenuePerPatient { get; set; }
        public List<DailyRevenueDTO> DailyRevenues { get; set; }
    }

    public class AppointmentStatisticsDTO
    {
        public int TotalAppointments { get; set; }
        public int PendingAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CancelledAppointments { get; set; }
        public double CompletionRate { get; set; }
        public List<AppointmentByStatusDTO> AppointmentsByStatus { get; set; }
    }

    public class StaffStatisticsDTO
    {
        public int TotalDoctors { get; set; }
        public int TotalNurses { get; set; }
        public int TotalTechnicians { get; set; }
        public int TotalReceptionists { get; set; }
        public double DoctorAttendanceRate { get; set; }
        public List<StaffByRoleDTO> StaffByRole { get; set; }
    }

    public class RoomUtilizationDTO
    {
        public int TotalExaminationRooms { get; set; }
        public int TotalLaboratoryRooms { get; set; }
        public int AvailableRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public double UtilizationRate { get; set; }
        public List<RoomStatusDTO> RoomStatuses { get; set; }
    }

    public class RecentActivityDTO
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string User { get; set; }
        public string Action { get; set; }
        public DateTime Time { get; set; }
    }

    public class SystemAlertDTO
    {
        public string Id { get; set; }
        public string Level { get; set; } // warning, error, info
        public string Message { get; set; }
        public DateTime Time { get; set; }
    }

    public class DailyRevenueDTO
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
    }

    public class AppointmentByStatusDTO
    {
        public string Status { get; set; }
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class StaffByRoleDTO
    {
        public string Role { get; set; }
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class RoomStatusDTO
    {
        public string RoomId { get; set; }
        public string RoomName { get; set; }
        public string RoomType { get; set; }
        public string Status { get; set; } // available, occupied, maintenance
        public string CurrentUser { get; set; }
    }
}
