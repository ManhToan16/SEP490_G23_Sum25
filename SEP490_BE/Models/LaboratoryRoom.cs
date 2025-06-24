using System;
using System.Collections.Generic;

namespace SEP490_BE.Models
{
    public partial class LaboratoryRoom
    {
        public LaboratoryRoom()
        {
            Assignments = new HashSet<Assignment>();
            Services = new HashSet<Service>();
        }

        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public virtual ICollection<Assignment> Assignments { get; set; }
        public virtual ICollection<Service> Services { get; set; }
    }
}
