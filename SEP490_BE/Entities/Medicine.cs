using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class Medicine
    {
        public Medicine()
        {
            PrescriptionItems = new HashSet<PrescriptionItem>();
        }

        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? ActiveIngredients { get; set; }
        public string? Strength { get; set; }
        public string? Packaging { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }

        public virtual ICollection<PrescriptionItem> PrescriptionItems { get; set; }
    }
}
