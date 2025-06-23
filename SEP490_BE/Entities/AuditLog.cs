using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class AuditLog
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public string? Action { get; set; }
        public string TableName { get; set; } = null!;
        public string RecordId { get; set; } = null!;
        public string? OldData { get; set; }
        public string? NewData { get; set; }
        public DateTime? ActionTime { get; set; }

        public virtual User? User { get; set; }
    }
}
