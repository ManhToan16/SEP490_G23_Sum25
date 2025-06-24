namespace SEP490_BE.DTO.DoctorProfileDTO
{
    public class CreateDoctorProfileDTO
    {
        public string DoctorId { get; set; } = null!;
        public string? Qualifications { get; set; }
        public int? YearsOfExperience { get; set; }
        public string? Biography { get; set; }
        public string? Avatar { get; set; }
    }
}
