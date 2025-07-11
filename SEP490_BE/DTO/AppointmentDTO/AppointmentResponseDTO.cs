using SEP490_BE.Constants;
using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.AppointmentDTO
{
    public class AppointmentResponseDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string Address { get; set; }
        public string Symptom { get; set; }
        public string RequiredDoctorId { get; set; }
        public string RequiredDoctorName { get; set; }
        public DateTime Date { get; set; }
        public string TimeSlotId { get; set; }
        public TimeSpan TimeSlotStartTime { get; set; }
        public TimeSpan TimeSlotEndTime { get; set; }
        public string Status { get; set; }
        public decimal? TotalPrice { get; set; }
        public DateTime? ExpiredAt { get; set; }
        public DateTime? CreatedAt { get; set; }

    }
}
