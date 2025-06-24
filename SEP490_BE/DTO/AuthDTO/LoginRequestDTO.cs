using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.AuthDTO
{
    public class LoginRequestDTO
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public string DeviceId { get; set; }
    }
}
