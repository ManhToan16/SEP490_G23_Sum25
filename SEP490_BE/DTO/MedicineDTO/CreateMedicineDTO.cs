using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.MedicineDTO
{
    public class CreateMedicineDTO
    {
        [Required(ErrorMessage = "Tên thuốc là bắt buộc.")]
        [StringLength(200, ErrorMessage = "Tên thuốc không được vượt quá 200 ký tự.")]
        public string Name { get; set; } = null!;
        [Required(ErrorMessage = "Hoạt chất là bắt buộc.")]
        public string ActiveIngredients { get; set; }
        [Required(ErrorMessage = "Hàm lượng là bắt buộc.")]
        public string Strength { get; set; }
        [Required(ErrorMessage = "Cách đóng góilà bắt buộc.")]
        [StringLength(50, ErrorMessage = "Quy cách đóng gói không được vượt quá 50 ký tự.")]
        public string Packaging { get; set; }
        [Required(ErrorMessage = "Đơn vị là bắt buộc.")]
        [StringLength(50, ErrorMessage = "Đơn vị  không được vượt quá 50 ký tự.")]
        public string Unit { get; set; }
        public string? Description { get; set; }
    }
}
