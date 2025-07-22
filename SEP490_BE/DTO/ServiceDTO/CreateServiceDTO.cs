using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.ServiceDTO
{
    public class CreateServiceDTO
    {
        [Required(ErrorMessage = "Phòng xét nghiệm là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "ID phòng xét nghiệm không được vượt quá 100 ký tự.")]
        public string LaboratoryRoomId { get; set; } = null!;

        [Required(ErrorMessage = "Tên dịch vụ là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên dịch vụ không được vượt quá 100 ký tự.")]
        [RegularExpression(@"^[\p{L}0-9\s\-]+$", ErrorMessage = "Tên dịch vụ không được chứa ký tự đặc biệt.")]
        public string Name { get; set; } = null!;

        [Range(0, 999999999.99, ErrorMessage = "Giá dịch vụ phải lớn hơn hoặc bằng 0.")]
        public decimal? Price { get; set; }

        [MaxLength(200, ErrorMessage = "Mô tả không được vượt quá 200 ký tự.")]
        public string? Description { get; set; }
    }
}
