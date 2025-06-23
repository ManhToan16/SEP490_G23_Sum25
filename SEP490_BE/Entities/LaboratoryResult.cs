using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class LaboratoryResult
    {
        public LaboratoryResult()
        {
            LaboratoryFiles = new HashSet<LaboratoryFile>();
        }

        public string Id { get; set; } = null!;
        public string ExaminationResultId { get; set; } = null!;
        public string TechnicianId { get; set; } = null!;
        public string AssignmentId { get; set; } = null!;
        public string? Note { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual Assignment Assignment { get; set; } = null!;
        public virtual ExaminationResult ExaminationResult { get; set; } = null!;
        public virtual User Technician { get; set; } = null!;
        public virtual ICollection<LaboratoryFile> LaboratoryFiles { get; set; }
    }
}
