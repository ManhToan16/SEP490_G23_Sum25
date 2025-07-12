using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.VisitDTO
{
    public class VisitResponseDTO
    {
        public string ExaminationRoomId { get; set; }
        public string AppointmentId { get; set; }
        public string AssignedDoctortId { get; set; }
        public string PatientProfileId { get; set; }
        public string PatientName { get; set; }
        public int QueueNumber { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; }
        public bool IsPrioritized { get; set; }
    }
}
