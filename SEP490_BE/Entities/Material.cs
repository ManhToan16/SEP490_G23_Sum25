using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Material
    {
        public Material()
        {
            Transactions = new HashSet<Transaction>();
        }

        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? CategoryId { get; set; }
        public string? SupplierId { get; set; }
        public string Unit { get; set; } = null!;
        public int QuantityInStock { get; set; }
        public int? MaxQuantity { get; set; }
        public int? MinQuantity { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual Category? Category { get; set; }
        public virtual Supplier? Supplier { get; set; }
        public virtual ICollection<Transaction> Transactions { get; set; }
    }
}
