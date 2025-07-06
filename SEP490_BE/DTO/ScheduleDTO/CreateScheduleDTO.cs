namespace SEP490_BE.DTO.ScheduleDTO
{
    public class CreateScheduleDTO
    {
        public string UserId { get; set; } = null!;
        public string RoomId { get; set; } = null!;
        public string TimeSlotId { get; set; } = null!;
        public DateTime Date { get; set; }
    }
}
