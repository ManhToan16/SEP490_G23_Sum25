using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;
using System.Reflection.Metadata.Ecma335;

namespace SEP490_BE.Repositories.RoleRepositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public RoleRepository(KhanhAnNeurologyClinicContext context) {
            _context = context;
        }
        public async Task<Role> FindRoleByName(string roleName)
                => await _context.Roles.SingleOrDefaultAsync(r => r.Name == roleName);

        public async Task ApplyRole(string userId, string roleName)
        {
            var existingUserRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserId == userId);

            if (existingUserRole != null)
            {
                existingUserRole.RoleName = roleName;
                _context.UserRoles.Update(existingUserRole);
            }
            else
            {
                await _context.UserRoles.AddAsync(new UserRole
                {
                    UserId = userId,
                    RoleName = roleName
                });
            }
        }

        public async Task<bool> CheckRoleExist(string roleName)
        {
            return await _context.Roles
                .AnyAsync(r => EF.Functions.Collate(r.Name, "Latin1_General_CS_AS") == roleName);
        }

        public async Task<List<string>> FindRolesByUser(string userId)
            => await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Select(ur => ur.RoleName)
                .ToListAsync();

        public async Task<List<string>> FindPermissionsByRole(string roleName)
        {
            return await _context.RolePermissions
                .Where(rp => rp.RoleName == roleName)
                .Select(rp => rp.PermissionName)
                .Distinct()
                .ToListAsync();
        }

    }
}
