namespace SEP490_BE.DTO.MaterialDTO
{
    public class UpdateMaterialDTO
    {
        public string? Name { get; set; }
        public string? CategoryId { get; set; }
        public string? SupplierId { get; set; }
        public string? Unit { get; set; }
        public int? QuantityInStock { get; set; }
        public int? MaxQuantity { get; set; }
        public int? MinQuantity { get; set; }
    }
}
