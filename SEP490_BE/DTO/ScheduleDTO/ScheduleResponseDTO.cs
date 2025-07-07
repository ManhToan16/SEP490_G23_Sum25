namespace SEP490_BE.DTO.ScheduleDTO
{
    public class ScheduleResponseDTO
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string RoomId { get; set; } = null!;
        public string RoomType { get; set; } = null!;
        public DateTime Date { get; set; }
        public string TimeSlotId { get; set; } = null!;
        public string Status { get; set; } = null!;
    }
}
