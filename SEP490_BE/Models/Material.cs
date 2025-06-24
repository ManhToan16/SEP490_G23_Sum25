using System;
using System.Collections.Generic;

namespace SEP490_BE.Models
{
    public partial class Material
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Code { get; set; }
        public string? Category { get; set; }
        public string Unit { get; set; } = null!;
        public int QuantityInStock { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
