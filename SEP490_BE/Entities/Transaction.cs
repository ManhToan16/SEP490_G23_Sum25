using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Transaction
    {
        public string Id { get; set; } = null!;
        public string MaterialId { get; set; } = null!;
        public string TransactionType { get; set; } = null!;
        public int Quantity { get; set; }
        public string? RoomId { get; set; }
        public string? RoomType { get; set; }
        public string UserId { get; set; } = null!;
        public string? Reason { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Material Material { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
