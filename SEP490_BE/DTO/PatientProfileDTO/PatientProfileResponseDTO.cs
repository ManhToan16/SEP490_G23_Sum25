namespace SEP490_BE.DTO.PatientProfileDTO
{
    public class PatientProfileResponseDTO
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string CitizenId { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = null!;
        public string Address { get; set; }
    }
}
