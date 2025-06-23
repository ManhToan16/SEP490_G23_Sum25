using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.UserRepositories
{
    public interface IUserRepository
    {
        Task<User> FindByEmail(string phoneNumber);
        Task<User> FindByPhoneNumber(string phoneNumber);
        Task<User> FindById(string UserId);
        Task<(List<User> Users, int TotalItems)> FindAll(
            string? role,
            string? email,
            string? phoneNumber,
            string? name,
            int pageNumber,
            int pageSize);
        Task Insert(User user);
        Task Update(User user);
        Task Delete(User user);
    }
}
