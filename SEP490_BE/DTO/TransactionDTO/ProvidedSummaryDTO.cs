namespace SEP490_BE.DTO.TransactionDTO
{
    public class ProvidedSummaryDTO
    {
        public string MaterialName { get; set; } = null!;
        public int TotalQuantity { get; set; }
        public string? RoomId { get; set; }
        public string? RoomType { get; set; }
        public string? RoomName { get; set; }
        public bool IsLowStock { get; set; } 
    }
}
