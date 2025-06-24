using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.AuthDTO
{
    public class LoginRequestDTO
    {
        [Required]
        public string PhoneNumber { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public string DeviceId { get; set; }
    }
}
