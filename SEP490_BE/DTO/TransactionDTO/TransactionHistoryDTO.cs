namespace SEP490_BE.DTO.TransactionDTO
{
    public class TransactionHistoryDTO
    {
        public string Id { get; set; }
        public string TransactionId { get; set; }
        public int OldQuantity { get; set; }
        public int NewQuantity { get; set; }
        public string OldReason { get; set; }
        public string NewReason { get; set; }
        public string ChangedBy { get; set; }
        public DateTime? ChangedAt { get; set; }
    }
}
