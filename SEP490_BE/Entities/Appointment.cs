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
            Queues = new HashSet<Queue>();
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
        public string AssignedDoctorId { get; set; } = null!;
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public string? Status { get; set; }
        public decimal? TotalPrice { get; set; }
        public DateTime? ExpiredAt { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual User AssignedDoctor { get; set; } = null!;
        public virtual PatientProfile? PatientProfile { get; set; }
        public virtual User? RequiredDoctor { get; set; }
        public virtual ICollection<Assignment> Assignments { get; set; }
        public virtual ICollection<ExaminationResult> ExaminationResults { get; set; }
        public virtual ICollection<Queue> Queues { get; set; }
    }
}
