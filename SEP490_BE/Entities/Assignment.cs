using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Assignment
    {
        public Assignment()
        {
            AssignmentServices = new HashSet<AssignmentService>();
            LaboratoryResults = new HashSet<LaboratoryResult>();
        }

        public string Id { get; set; } = null!;
        public string LaboratoryRoomId { get; set; } = null!;
        public string VisitId { get; set; } = null!;
        public decimal? TotalPrice { get; set; }
        public string? Status { get; set; }
        public DateTime? CreateAt { get; set; }

        public virtual LaboratoryRoom LaboratoryRoom { get; set; } = null!;
        public virtual Visit Visit { get; set; } = null!;
        public virtual ICollection<AssignmentService> AssignmentServices { get; set; }
        public virtual ICollection<LaboratoryResult> LaboratoryResults { get; set; }
    }
}
