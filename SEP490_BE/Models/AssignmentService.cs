using System;
using System.Collections.Generic;

namespace SEP490_BE.Models
{
    public partial class AssignmentService
    {
        public int Id { get; set; }
        public string AssignmentId { get; set; } = null!;
        public string ServiceId { get; set; } = null!;

        public virtual Assignment Assignment { get; set; } = null!;
        public virtual Service Service { get; set; } = null!;
    }
}
