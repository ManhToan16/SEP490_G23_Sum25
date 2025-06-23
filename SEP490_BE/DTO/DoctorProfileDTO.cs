namespace SEP490_BE.DTO
{
    public class DoctorProfileDTO
    {
        public string Id { get; set; } = null!;
        public string DoctorId { get; set; } = null!;
        public string? Qualifications { get; set; }
        public int? YearsOfExperience { get; set; }
        public string? Biography { get; set; }
        public string? Avatar { get; set; }
    }
}
