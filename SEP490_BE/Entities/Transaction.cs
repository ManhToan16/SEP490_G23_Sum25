using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Transaction
    {
        public Transaction()
        {
            TransactionHistories = new HashSet<TransactionHistory>();
        }

        public string Id { get; set; } = null!;
        public string MaterialId { get; set; } = null!;
        public string TransactionType { get; set; } = null!;
        public int Quantity { get; set; }
        public int? DefectiveQuantity { get; set; }
        public string? RoomId { get; set; }
        public string? RoomType { get; set; }
        public string UserId { get; set; } = null!;
        public string? Reason { get; set; }
        public string? Status { get; set; }
        public string? SupplierId { get; set; } = null!;
        public decimal? Price { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Material Material { get; set; } = null!;
        public virtual ICollection<TransactionHistory> TransactionHistories { get; set; }
        public virtual Supplier Supplier { get; set; }
        public virtual User User { get; set; } = null!;
    }
}
