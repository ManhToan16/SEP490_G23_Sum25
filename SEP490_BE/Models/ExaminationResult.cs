using System;
using System.Collections.Generic;

namespace SEP490_BE.Models
{
    public partial class ExaminationResult
    {
        public ExaminationResult()
        {
            LaboratoryResults = new HashSet<LaboratoryResult>();
            Prescriptions = new HashSet<Prescription>();
        }

        public string Id { get; set; } = null!;
        public string MedicalRecordId { get; set; } = null!;
        public string DoctorId { get; set; } = null!;
        public string AppointmentId { get; set; } = null!;
        public string? Summary { get; set; }
        public string? Conclusion { get; set; }
        public bool? IsCompleted { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual Appointment Appointment { get; set; } = null!;
        public virtual User Doctor { get; set; } = null!;
        public virtual MedicalRecord MedicalRecord { get; set; } = null!;
        public virtual ICollection<LaboratoryResult> LaboratoryResults { get; set; }
        public virtual ICollection<Prescription> Prescriptions { get; set; }
    }
}
