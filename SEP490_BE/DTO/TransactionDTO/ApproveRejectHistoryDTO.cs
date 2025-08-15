namespace SEP490_BE.DTO.TransactionDTO
{
    public class ApproveRejectHistoryDTO
    {
        public string HistoryId { get; set; }
        public string TransactionId { get; set; }
        public string MaterialId { get; set; }
        public string MaterialName { get; set; }
        public int Quantity { get; set; }
        public string Action { get; set; } // "Được phê duyệt" hoặc "Bị từ chối"
        public string ChangedBy { get; set; }
        public DateTime? ChangedAt { get; set; }
    }

}
