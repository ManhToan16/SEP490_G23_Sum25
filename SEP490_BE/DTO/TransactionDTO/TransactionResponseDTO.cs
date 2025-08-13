namespace SEP490_BE.DTO.TransactionDTO
{
    public class TransactionResponseDTO
    {
        public string Id { get; set; }
        public string MaterialId { get; set; }
        public string? MaterialName { get; set; }
        public string TransactionType { get; set; }
        public int Quantity { get; set; }
        public int? DefectiveQuantity { get; set; }
        public string? RoomId { get; set; }
        public string? RoomType { get; set; }
        public string UserId { get; set; }
        public string? UserName { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; }
        public string  CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
        public decimal? Price { get; set; }
        public string? SupplierId { get; set; }
        public string? SupplierName { get; set; }
        public bool IsEdit { get; set; }
    }
}
