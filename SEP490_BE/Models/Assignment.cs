using System;
using System.Collections.Generic;

namespace SEP490_BE.Models
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
        public string AppointmentId { get; set; } = null!;
        public decimal? TotalPrice { get; set; }
        public bool? IsPrioritized { get; set; }
        public string? Status { get; set; }
        public DateTime? CreateAt { get; set; }

        public virtual Appointment Appointment { get; set; } = null!;
        public virtual LaboratoryRoom LaboratoryRoom { get; set; } = null!;
        public virtual ICollection<AssignmentService> AssignmentServices { get; set; }
        public virtual ICollection<LaboratoryResult> LaboratoryResults { get; set; }
    }
}
