using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.TransactionDTO
{
    public class ImportMaterialDTO
    {
        [Required(ErrorMessage = "MaterialId không được để trống.")]
        public string MaterialId { get; set; } = null!;

        [Range(0, double.MaxValue, ErrorMessage = "Price phải lớn hơn hoặc bằng 0.")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Quantity không được để trống.")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity phải lớn hơn 0.")]
        public int Quantity { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "DefectiveQuantity phải lớn hơn hoặc bằng 0.")]
        public int DefectiveQuantity { get; set; }

        [Required(ErrorMessage = "SupplierId không được để trống.")]
        public string SupplierId { get; set; } = null!;

        public string? Reason { get; set; }
    }
}
