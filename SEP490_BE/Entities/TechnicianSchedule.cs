using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class TechnicianSchedule
    {
        public string Id { get; set; } = null!;
        public string TechnicianId { get; set; } = null!;
        public string LaboratoryRoomId { get; set; } = null!;
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public virtual LaboratoryRoom LaboratoryRoom { get; set; } = null!;
        public virtual User Technician { get; set; } = null!;
    }
}
