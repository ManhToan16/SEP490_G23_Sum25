namespace SEP490_BE.DTO.ScheduleDTO
{
    public class CreateScheduleRangeDTO
    {
        public List<ScheduleAssignment> ScheduleAssignments { get; set; } = null!;
    }

    public class ScheduleAssignment
    {
        public DateTime Date { get; set; }
        public string RoomId { get; set; } = null!;
        public string TimeSlotId { get; set; } = null!;
        public string DoctorName { get; set; }  // tên đọc từ file Excel
        public string UserId { get; set; }      // userId truy ra từ tên doctor
        public string Role { get; set; }        // role tương ứng (DOCTOR / TECHNICIAN / NURSE)
    }
}
