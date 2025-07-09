using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class PrescriptionItem
    {
        public string Id { get; set; } = null!;
        public string PrescriptionId { get; set; } = null!;
        public string MedicineId { get; set; } = null!;
        public string? Dosage { get; set; }
        public string? Frequency { get; set; }
        public string? Duration { get; set; }
        public string? Instructions { get; set; }

        public virtual Medicine Medicine { get; set; } = null!;
        public virtual Prescription Prescription { get; set; } = null!;
    }
}
