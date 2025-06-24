using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.AuthDTO
{
    public class TokenResponseDTO
    {
        [Required]
        public string AccessToken { get; set; }
        [Required]
        public string RefreshToken { get; set; }
        public DateTime AccessTokenExpiresAt { get; set; }
    }
}
