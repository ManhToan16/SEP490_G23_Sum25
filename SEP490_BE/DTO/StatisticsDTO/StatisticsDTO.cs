namespace SEP490_BE.DTO.StatisticsDTO
{
    public class PatientStatisticsDTO
    {
        public int TotalPatients { get; set; }
        public int NewPatients { get; set; }
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


}
