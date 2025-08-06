using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.DoctorProfileDTO
{
    public class UpdateDoctorProfileDTO
    {
        public string? Qualifications { get; set; }
        [Range(0, 60, ErrorMessage = "Số năm kinh nghiệm phải từ 0 đến 60.")]
        public int? YearsOfExperience { get; set; }
        public string? Biography { get; set; }
        public string? Avatar { get; set; }
    }
}
