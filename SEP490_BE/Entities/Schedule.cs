using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Schedule
    {
        public Schedule()
        {
            ScheduleChangeRequestRequesterSchedules = new HashSet<ScheduleChangeRequest>();
            ScheduleChangeRequestTargetSchedules = new HashSet<ScheduleChangeRequest>();
        }

        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string RoomId { get; set; } = null!;
        public string RoomType { get; set; } = null!;
        public DateTime Date { get; set; }
        public string TimeSlotId { get; set; } = null!;
        public string? Status { get; set; }

        public virtual TimeSlot TimeSlot { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual ICollection<ScheduleChangeRequest> ScheduleChangeRequestRequesterSchedules { get; set; }
        public virtual ICollection<ScheduleChangeRequest> ScheduleChangeRequestTargetSchedules { get; set; }
    }
}
