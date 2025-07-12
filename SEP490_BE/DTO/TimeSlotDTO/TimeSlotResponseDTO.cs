namespace SEP490_BE.DTO.TimeSlotDTO
{
    public class TimeSlotResponseDTO
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? Description { get; set; }
    }
}
