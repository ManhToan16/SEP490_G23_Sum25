using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class TransactionHistory
    {
        public string Id { get; set; } = null!;
        public string TransactionId { get; set; } = null!;
        public int OldQuantity { get; set; }
        public int NewQuantity { get; set; }
        public string OldReason { get; set; } = null!;
        public string NewReason { get; set; } = null!;
        public string ChangedBy { get; set; } = null!;
        public DateTime? ChangedAt { get; set; }

        public virtual User ChangedByNavigation { get; set; } = null!;
        public virtual Material Transaction { get; set; } = null!;
    }
}
