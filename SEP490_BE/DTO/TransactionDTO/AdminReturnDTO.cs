namespace SEP490_BE.DTO.TransactionDTO
{
    public class AdminReturnDTO
    {
        public string TransactionId { get; set; } = null!;
        public int Quantity { get; set; }
        public string Reason { get; set; } = null!;
    }
}
