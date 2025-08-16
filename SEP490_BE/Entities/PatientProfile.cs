using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class PatientProfile
    {
        public PatientProfile()
        {
            MedicalRecords = new HashSet<MedicalRecord>();
            Visits = new HashSet<Visit>();
        }

        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? CitizenId { get; set; }
        public string PhoneNumber { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = null!;
        public string? Address { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual ICollection<MedicalRecord> MedicalRecords { get; set; }
        public virtual ICollection<Visit> Visits { get; set; }
    }
}
