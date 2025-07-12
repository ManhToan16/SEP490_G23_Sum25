namespace SEP490_BE.DTO.ServiceDTO
{
    public class CreateServiceDTO
    {
        public string LaboratoryRoomId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public decimal? Price { get; set; }
        public string? Description { get; set; }
    }
}
