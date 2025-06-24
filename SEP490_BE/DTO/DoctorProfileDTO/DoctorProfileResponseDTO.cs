namespace SEP490_BE.DTO.DoctorProfileDTO
{
    public class DoctorProfileResponseDTO
    {
        public string Id { get; set; } = null!;
        public string DoctorId { get; set; } = null!;
        public string? Qualifications { get; set; }
        public int? YearsOfExperience { get; set; }
        public string? Biography { get; set; }
        public string? Avatar { get; set; }
        public string? Name { get; set; } 
        public string? PhoneNumber { get; set; } 
        public string? Email { get; set; } 
        public DateTime? DateOfBirth { get; set; } 
    }
}
