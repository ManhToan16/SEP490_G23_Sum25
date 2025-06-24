namespace SEP490_BE.DTO.DoctorScheduleDTO
{
    public class UpdateDoctorScheduleDTO
    {
        public string? ExaminationRoomId { get; set; }
        public DateTime? Date { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public bool? IsAvailable { get; set; }
    }
}
