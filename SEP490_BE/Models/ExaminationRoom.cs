using System;
using System.Collections.Generic;

namespace SEP490_BE.Models
{
    public partial class ExaminationRoom
    {
        public ExaminationRoom()
        {
            DoctorSchedules = new HashSet<DoctorSchedule>();
            Queues = new HashSet<Queue>();
        }

        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public virtual ICollection<DoctorSchedule> DoctorSchedules { get; set; }
        public virtual ICollection<Queue> Queues { get; set; }
    }
}
