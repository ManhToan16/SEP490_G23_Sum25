using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Queue
    {
        public string Id { get; set; } = null!;
        public string ExaminationRoomId { get; set; } = null!;
        public string AppointmentId { get; set; } = null!;
        public decimal? TotalPrice { get; set; }
        public bool? IsPrioritized { get; set; }
        public int QueueNumber { get; set; }
        public string? Status { get; set; }
        public DateTime? CreateAt { get; set; }

        public virtual Appointment Appointment { get; set; } = null!;
        public virtual ExaminationRoom ExaminationRoom { get; set; } = null!;
    }
}
