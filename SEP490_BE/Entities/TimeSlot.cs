using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class TimeSlot
    {
        public TimeSlot()
        {
            Appointments = new HashSet<Appointment>();
            Schedules = new HashSet<Schedule>();
        }

        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? Description { get; set; }

        public virtual ICollection<Appointment> Appointments { get; set; }
        public virtual ICollection<Schedule> Schedules { get; set; }
    }
}
