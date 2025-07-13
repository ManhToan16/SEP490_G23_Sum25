namespace SEP490_BE.DTO.CategoryDTO
{
    public class CategoryResponseDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
    }

}
