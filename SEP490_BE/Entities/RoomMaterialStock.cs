using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class RoomMaterialStock
    {
        public string Id { get; set; } = null!;
        public string RoomId { get; set; } = null!;
        public string RoomType { get; set; } = null!;
        public string MaterialId { get; set; } = null!;
        public int Quantity { get; set; }
        public int? MinQuantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }

        public virtual Material Material { get; set; } = null!;
    }
}
