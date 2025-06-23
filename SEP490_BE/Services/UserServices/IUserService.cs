using SEP490_BE.DTO;
using SEP490_BE.DTO.AuthDTO;
using SEP490_BE.DTO.UserDTO;

namespace SEP490_BE.Services.UserServices
{
    public interface IUserService
    {
        Task<Pagination<UserResponseDTO>> GetAll(
            string? role,
            string? email,
            string? phoneNumber,
            string? name,
            int pageNumber,
            int pageSize);
        Task<UserResponseDTO> GetUserById(string id);
        Task<UserResponseDTO> Create(CreateUserDTO request);
        Task<UserResponseDTO> Update(string id, UpdateUserDTO request);
        Task Delete(string id);
    }
}
