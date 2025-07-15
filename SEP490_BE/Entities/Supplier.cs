using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Supplier
    {
        public Supplier()
        {
            Materials = new HashSet<Material>();
            Transactions = new HashSet<Transaction>();
        }

        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual ICollection<Material> Materials { get; set; }
        public virtual ICollection<Transaction> Transactions { get; set; }

    }
}
