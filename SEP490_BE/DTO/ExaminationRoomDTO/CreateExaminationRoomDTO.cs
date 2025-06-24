namespace SEP490_BE.DTO.ExaminationRoomDTO
{
    public class CreateExaminationRoomDTO
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}
