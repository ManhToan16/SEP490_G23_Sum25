using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class DoctorSchedule
    {
        public string Id { get; set; } = null!;
        public string DoctorId { get; set; } = null!;
        public string ExaminationRoomId { get; set; } = null!;
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public virtual User Doctor { get; set; } = null!;
        public virtual ExaminationRoom ExaminationRoom { get; set; } = null!;
    }
}
