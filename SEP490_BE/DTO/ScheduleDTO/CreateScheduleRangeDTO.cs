namespace SEP490_BE.DTO.ScheduleDTO
{
    public class CreateScheduleRangeDTO
    {
        public string UserId { get; set; } = null!;
        public List<ScheduleAssignment> ScheduleAssignments { get; set; } = null!;
    }

    public class ScheduleAssignment
    {
        public DateTime Date { get; set; }
        public string RoomId { get; set; } = null!;
        public string TimeSlotId { get; set; } = null!;
    }
}
