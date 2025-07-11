namespace SEP490_BE.DTO.MedicineDTO
{
    public class CreateMedicineDTO
    {
        public string Name { get; set; } = null!;
        public string? ActiveIngredients { get; set; }
        public string? Strength { get; set; }
        public string? Packaging { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
    }
}
