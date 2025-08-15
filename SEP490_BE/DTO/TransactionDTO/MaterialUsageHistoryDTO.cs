namespace SEP490_BE.DTO.TransactionDTO
{
    public class MaterialUsageHistoryDTO
    {
        public string HistoryId { get; set; }
        public string RoomId { get; set; }
        public string MaterialId { get; set; }
        public string MaterialName { get; set; }
        public int OldQuantity { get; set; }
        public int NewQuantity { get; set; }
        public int QuantityUsed { get; set; }
        public string ChangedBy { get; set; }
        public DateTime ChangedAt { get; set; }
    }

}
