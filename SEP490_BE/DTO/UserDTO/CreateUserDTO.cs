using SEP490_BE.Constants;
using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.UserDTO
{
    public class CreateUserDTO
    {
        [Required(ErrorMessage = MessageConstants.NULL_USERNAME)]
        [StringLength(100, MinimumLength = 2, ErrorMessage = MessageConstants.INVALID_USERNAME_LENGTH)]
        [RegularExpression(@"^[a-zA-ZÀ-ỹ\s]+$", ErrorMessage = MessageConstants.INVALID_USERNAME_CHARACTER)]
        public string Name { get; set; }

        [Required]
        [StringLength(10, MinimumLength = 10, ErrorMessage = MessageConstants.INVALID_PHONE_NUMBER_LENGTH)]
        [RegularExpression(@"^(03|05|07|08|09)\d{8}$", ErrorMessage = MessageConstants.INVALID_PHONE_NUMBER_CHARACTER)]
        public string PhoneNumber { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = MessageConstants.INVALID_EMAIL)]
        public string Email { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = MessageConstants.INVALID_PASSWORD)]
        public string Password { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public string Gender { get; set; }

        public string Address { get; set; }

        [Required]
        public string Role { get; set; }
    }
}
