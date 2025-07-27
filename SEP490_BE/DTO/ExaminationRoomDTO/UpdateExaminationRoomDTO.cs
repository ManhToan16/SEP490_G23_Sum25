using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.ExaminationRoomDTO
{
    public class UpdateExaminationRoomDTO
    {
        [Required(ErrorMessage = "Tên phòng là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên phòng không được vượt quá 100 ký tự.")]
        [RegularExpression(@"^[a-zA-Z0-9\sÀ-ỹ]+$", ErrorMessage = "Tên phòng không được chứa ký tự đặc biệt.")]
        public string Name { get; set; } = null!;
        [MaxLength(200, ErrorMessage = "Mô tả không được vượt quá 200 ký tự.")]
        public string? Description { get; set; }
    }
}
