using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class ScheduleChangeRequest
    {
        public string Id { get; set; } = null!;
        public string RequesterId { get; set; } = null!;
        public string RequesterScheduleId { get; set; } = null!;
        public string TargetUserId { get; set; } = null!;
        public string TargetScheduleId { get; set; } = null!;
        public string Reason { get; set; } = null!;
        public string? Status { get; set; }

        public virtual User Requester { get; set; } = null!;
        public virtual Schedule RequesterSchedule { get; set; } = null!;
        public virtual Schedule TargetSchedule { get; set; } = null!;
        public virtual User TargetUser { get; set; } = null!;
    }
}
