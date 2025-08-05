using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class ExaminationRoom
    {
        public ExaminationRoom()
        {
            Visits = new HashSet<Visit>();
        }

        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public bool? IsActive { get; set; }

        public virtual ICollection<Visit> Visits { get; set; }
    }
}
