namespace SEP490_BE.DTO.ScheduleDTO
{
    public class CreateScheduleRangeDTO
    {
        public string UserId { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string RoomId { get; set; } = null!;
        public string RoomType { get; set; } = null!;
        public string TimeSlotId { get; set; } = null!;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
    }
}
