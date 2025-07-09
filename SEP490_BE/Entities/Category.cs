using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Category
    {
        public Category()
        {
            Materials = new HashSet<Material>();
        }

        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual ICollection<Material> Materials { get; set; }
    }
}
