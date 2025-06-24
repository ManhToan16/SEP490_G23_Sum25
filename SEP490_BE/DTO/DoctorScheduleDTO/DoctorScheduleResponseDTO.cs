namespace SEP490_BE.DTO.DoctorScheduleDTO
{
    public class DoctorScheduleResponseDTO
    {
        public string Id { get; set; } = null!;
        public string DoctorId { get; set; } = null!;
        public string ExaminationRoomId { get; set; } = null!;
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool? IsAvailable { get; set; }
    }
}
