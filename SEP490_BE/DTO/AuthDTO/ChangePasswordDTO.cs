using SEP490_BE.Constants;
using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.AuthDTO
{
    public class ChangePasswordDTO
    {
        [Required]
        public string OldPassword { get; set; }
        [Required]
        [MinLength(8, ErrorMessage = MessageConstants.INVALID_PASSWORD)]
        public string Password { get; set; }
        [Required]
        [Compare("Password", ErrorMessage = MessageConstants.INVALID_REPASSWORD)]
        public string Repassword { get; set; }
    }
}
