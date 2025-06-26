namespace SEP490_BE.DTO.TechnicianScheduleDTO
{
    public class CreateTechnicianScheduleDTO
    {
        public string TechnicianId { get; set; } = null!;
        public string LaboratoryRoomId { get; set; } = null!;
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}
