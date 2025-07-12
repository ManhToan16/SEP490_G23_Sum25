using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.VisitDTO
{
    public class VisitRequestDTO
    {
        [Required]
        public string ExaminationRoomId { get; set; }

        [Required]
        public string AppointmentId { get; set; }

        [Required]
        public string AssignedDoctortId { get; set; }

        [Required]
        public string PatientProfileId { get; set; }

        public bool IsPrioritized { get; set; }
    }
}
