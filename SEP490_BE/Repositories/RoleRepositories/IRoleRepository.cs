using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.RoleRepositories
{
    public interface IRoleRepository
    {
        Task<Role> FindRoleByName(string roleName);
        Task ApplyRole(string userId, string roleName);
        Task<bool> CheckRoleExist(string roleName);
        Task<List<string>> FindRolesByUser(string userId);
        Task<List<string>> FindPermissionsByRole(string roleName);


    }
}
