using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Service
    {
        public Service()
        {
            AssignmentServices = new HashSet<AssignmentService>();
        }

        public string Id { get; set; } = null!;
        public string LaboratoryRoomsId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public decimal? Price { get; set; }
        public string? Description { get; set; }

        public virtual LaboratoryRoom LaboratoryRooms { get; set; } = null!;
        public virtual ICollection<AssignmentService> AssignmentServices { get; set; }
    }
}
