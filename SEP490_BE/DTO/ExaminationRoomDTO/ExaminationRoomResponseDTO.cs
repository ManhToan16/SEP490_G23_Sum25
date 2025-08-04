namespace SEP490_BE.DTO.ExaminationRoomDTO
{
    public class ExaminationRoomResponseDTO
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
    }
}
