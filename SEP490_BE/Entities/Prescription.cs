using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Prescription
    {
        public Prescription()
        {
            PrescriptionItems = new HashSet<PrescriptionItem>();
        }

        public string Id { get; set; } = null!;
        public string ExaminationResultId { get; set; } = null!;
        public string? Note { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual ExaminationResult ExaminationResult { get; set; } = null!;
        public virtual ICollection<PrescriptionItem> PrescriptionItems { get; set; }
    }
}
