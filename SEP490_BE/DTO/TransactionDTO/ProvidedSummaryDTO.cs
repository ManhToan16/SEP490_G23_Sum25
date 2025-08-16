using Microsoft.Extensions.FileSystemGlobbing;

namespace SEP490_BE.DTO.TransactionDTO
{
    public class ProvidedSummaryDTO
    {
        public string MaterialId { get; set; } = null!;
        public string MaterialName { get; set; } = null!;
        public int TotalQuantity => BatchInfo.Sum(b => b.Quantity);
        public string? RoomId { get; set; }
        public string? RoomType { get; set; }
        public string? RoomName { get; set; }
        public List<BatchInfoDTO> BatchInfo { get; set; } = new List<BatchInfoDTO>();
        public bool IsLowStock { get; set; } 
    }
}
