using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.MaterialDTO
{
    public class CreateMaterialDTO
    {
        [Required(ErrorMessage = "Tên vật tư là bắt buộc.")]
        [StringLength(255, ErrorMessage = "Tên vật tư không được vượt quá 255 ký tự.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Danh mục vật tư là bắt buộc.")]
        public string CategoryId { get; set; } = null!;

        [Required(ErrorMessage = "Nhà cung cấp là bắt buộc.")]
        public string SupplierId { get; set; } = null!;

        [Required(ErrorMessage = "Đơn vị tính là bắt buộc.")]
        [StringLength(50, ErrorMessage = "Đơn vị tính không được vượt quá 50 ký tự.")]
        public string Unit { get; set; } = null!;

        [Required(ErrorMessage = "Số lượng tồn kho là bắt buộc.")]
        [Range(0, int.MaxValue, ErrorMessage = "Số lượng tồn kho phải >= 0.")]
        public int QuantityInStock { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Số lượng tối đa phải >= 1.")]
        public int? MaxQuantity { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Số lượng tối thiểu phải >= 0.")]
        public int? MinQuantity { get; set; }
    }
}
