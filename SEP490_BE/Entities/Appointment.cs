using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Appointment
    {
        public Appointment()
        {
            Assignments = new HashSet<Assignment>();
            ExaminationResults = new HashSet<ExaminationResult>();
            Visits = new HashSet<Visit>();
        }

        public string Id { get; set; } = null!;
        public string? PatientProfileId { get; set; }
        public string Name { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = null!;
        public string? Address { get; set; }
        public string? Symptom { get; set; }
        public string? RequiredDoctorId { get; set; }
        public DateTime Date { get; set; }
        public string TimeSlotId { get; set; } = null!;
        public string? Status { get; set; }
        public decimal? TotalPrice { get; set; }
        public DateTime? ExpiredAt { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual PatientProfile? PatientProfile { get; set; }
        public virtual User? RequiredDoctor { get; set; }
        public virtual TimeSlot TimeSlot { get; set; } = null!;
        public virtual ICollection<Assignment> Assignments { get; set; }
        public virtual ICollection<ExaminationResult> ExaminationResults { get; set; }
        public virtual ICollection<Visit> Visits { get; set; }
    }
}
