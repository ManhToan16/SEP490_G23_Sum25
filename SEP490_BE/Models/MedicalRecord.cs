using System;
using System.Collections.Generic;

namespace SEP490_BE.Models
{
    public partial class MedicalRecord
    {
        public MedicalRecord()
        {
            ExaminationResults = new HashSet<ExaminationResult>();
        }

        public string Id { get; set; } = null!;
        public string PatientProfileId { get; set; } = null!;
        public string? MedicalHistory { get; set; }
        public string? Allergies { get; set; }
        public string? SurgicalHistory { get; set; }
        public string? Treatment { get; set; }
        public string? CurrentMedications { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual PatientProfile PatientProfile { get; set; } = null!;
        public virtual ICollection<ExaminationResult> ExaminationResults { get; set; }
    }
}
