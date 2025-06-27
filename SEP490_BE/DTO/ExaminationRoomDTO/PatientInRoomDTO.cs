namespace SEP490_BE.DTO.ExaminationRoomDTO
{
    public class PatientInRoomDTO
    {
        public string AppointmentId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public DateTime? CreateAt { get; set; }
    }
}
