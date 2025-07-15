namespace SEP490_BE.DTO.TransactionDTO
{
    public class ProvideMaterialDTO
    {
        public string MaterialId { get; set; } = null!;
        public int Quantity { get; set; }
        public string RoomId { get; set; } = null!;
    }
}
