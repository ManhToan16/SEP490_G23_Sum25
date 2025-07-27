using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.SupplierDTO
{
    public class CreateSupplierDTO
    {
        [Required(ErrorMessage = "Tên nhà cung cấp là bắt buộc.")]
        [StringLength(100, ErrorMessage = "Tên nhà cung cấp không được vượt quá 100 ký tự.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Số điện thoại là bắt buộc.")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
        [StringLength(10, ErrorMessage = "Số điện thoại không được vượt quá 10 ký tự.")]
        public string PhoneNumber { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
    }
}
