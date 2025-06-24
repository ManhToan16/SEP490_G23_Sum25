using SEP490_BE.DTO.AuthDTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Services.AuthServices
{
    public interface IAuthService
    {
        Task<TokenResponseDTO> Login(LoginRequestDTO request);
        Task<TokenResponseDTO> RefreshToken(TokenRequestDTO dto);
        Task Logout(TokenRequestDTO request);
        Task ForgotPassword(ForgotPasswordDTO request);
        Task ChangePassword();
        Task<User> GetAuthenticatedUser();
        Task ResetPassword(string token, string newPassword);
    }
}
