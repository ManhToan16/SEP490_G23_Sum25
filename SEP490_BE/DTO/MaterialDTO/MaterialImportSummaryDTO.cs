namespace SEP490_BE.DTO.MaterialDTO
{
    public class MaterialImportSummaryDTO
    {
        public string MaterialId { get; set; } = null!;
        public string MaterialName { get; set; } = null!;
        public string Unit { get; set; } = null!;
        public int Quantity { get; set; }
        public int AvailableQuantity { get; set; }
        public decimal TotalPrice { get; set; }
        public string CategoryName { get; set; } = null!;
        public string SupplierName { get; set; } = null!;
    }

}
