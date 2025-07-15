namespace SEP490_BE.DTO.TransactionDTO
{
    public class ImportMaterialDTO
    {
        public string MaterialId { get; set; } = null!;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public int DefectiveQuantity { get; set; }
        public DateTime ExpirationDate { get; set; }
        public string SupplierId { get; set; } = null!;
        public string? Reason { get; set; }
    }
}
