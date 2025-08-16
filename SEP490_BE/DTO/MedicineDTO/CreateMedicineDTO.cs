using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.MedicineDTO
{
    public class CreateMedicineDTO
    {
        [Required(ErrorMessage = "Tên thuốc là bắt buộc.")]
        [StringLength(100, ErrorMessage = "Tên thuốc không được vượt quá 100 ký tự.")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-.]*$", ErrorMessage = "Tên thuốc chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu chấm.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Hoạt chất là bắt buộc.")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-.]*$", ErrorMessage = "Hoạt chất chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu chấm.")]
        public string ActiveIngredients { get; set; } = null!;

        [Required(ErrorMessage = "Hàm lượng là bắt buộc.")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-.]*$", ErrorMessage = "Hàm lượng chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu chấm.")]
        public string Strength { get; set; } = null!;

        [Required(ErrorMessage = "Cách đóng gói là bắt buộc.")]
        [StringLength(50, ErrorMessage = "Quy cách đóng gói không được vượt quá 50 ký tự.")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-.]*$", ErrorMessage = "Quy cách đóng gói chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu chấm.")]
        public string Packaging { get; set; } = null!;

        [Required(ErrorMessage = "Đơn vị là bắt buộc.")]
        [StringLength(50, ErrorMessage = "Đơn vị không được vượt quá 50 ký tự.")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-.]*$", ErrorMessage = "Đơn vị chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu chấm.")]
        public string Unit { get; set; } = null!;

        public string? Description { get; set; } 
    }
}
