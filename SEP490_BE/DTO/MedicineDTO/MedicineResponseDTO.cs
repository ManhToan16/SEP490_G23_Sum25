namespace SEP490_BE.DTO.MedicineDTO
{
    public class MedicineResponseDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string? ActiveIngredients { get; set; }
        public string? Strength { get; set; }
        public string? Packaging { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
    }
}
