namespace SEP490_BE.DTO.TransactionDTO
{
    public class ProvideHistoryDTO
    {
        public string MaterialId { get; set; }
        public string MaterialName { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int RoomCount { get; set; }
        public List<RoomDetailDTO> RoomDetails { get; set; } = new();

    }

    public class RoomDetailDTO
    {
        public string RoomId { get; set; }
        public string RoomName { get; set; }
        public string RoomType { get; set; }
        public List<BatchInfoDTO> BatchInfo { get; set; }
    }


}
