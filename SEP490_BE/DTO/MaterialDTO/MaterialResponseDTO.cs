namespace SEP490_BE.DTO.MaterialDTO
{
    public class MaterialResponseDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string SupplierId { get; set; }
        public string? SupplierName { get; set; }
        public string Unit { get; set; }
        public int QuantityInStock { get; set; }
        public int? MaxQuantity { get; set; }
        public int? MinQuantity { get; set; }
        public string CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
        public bool IsLowStock { get; set; }
    }
}
