namespace SEP490_BE.DTO.TechnicianScheduleDTO
{
    public class UpdateTechnicianScheduleDTO
    {
        public string? LaboratoryRoomId { get; set; }
        public DateTime? Date { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
    }
}
