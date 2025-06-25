namespace SEP490_BE.DTO.ExaminationRoomDTO
{
    public class ExaminationRoomResponseDTO
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int DoctorScheduleCount { get; set; }
        public int QueueCount { get; set; }
    }
}
