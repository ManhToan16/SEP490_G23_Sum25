namespace SEP490_BE.DTO.MaterialDTO
{
    public class CreateMaterialDTO
    {
        public string Name { get; set; } = null!;
        public string CategoryId { get; set; } = null!;
        public string SupplierId { get; set; } = null!;
        public string Unit { get; set; } = null!;
        public int QuantityInStock { get; set; }
        public int? MaxQuantity { get; set; }
        public int? MinQuantity { get; set; }
    }
}
