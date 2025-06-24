using SEP490_BE.Constants;
using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.AuthDTO
{
    public class ForgotPasswordDTO
    {
        [Required]
        [EmailAddress(ErrorMessage = MessageConstants.INVALID_EMAIL)]
        public string Email { get; set; }
    }
}
