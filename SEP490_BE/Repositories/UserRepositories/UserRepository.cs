using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.UserRepositories
{
    public class UserRepository : IUserRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public UserRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }
        public async Task<User> FindById(string userId) => await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        public async Task<User> FindByEmail(string email) => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        public async Task<User> FindByPhoneNumber(string phoneNumber) => await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);
        public async Task<(List<User> Users, int TotalItems)> FindAll(
            string? role,
            string? email,
            string? phoneNumber,
            string? name,
            int pageNumber,
            int pageSize)
        {
            var query = _context.Users.Include(u => u.UserRoles).AsQueryable();
            if (!string.IsNullOrWhiteSpace(role)){
                query = query.Where(u => u.UserRoles.Any(r => r.RoleName == role));
            }
            if (!string.IsNullOrWhiteSpace(email)){
                query = query.Where(u => u.Email.Contains(email));
            }
            if (!string.IsNullOrWhiteSpace(phoneNumber)){
                query = query.Where(u => u.PhoneNumber.Contains(phoneNumber));
            }
            if (!string.IsNullOrWhiteSpace(name)){
                query = query.Where(u => u.Name.Contains(name));
            }
            var totalItems = await query.CountAsync();
            var users = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            return (users, totalItems);
        }

        public async Task Insert(User user) => await _context.Users.AddAsync(user);
        public async Task Update(User user) => _context.Users.Update(user);
        public async Task Delete(User user) => _context.Users.Remove(user);
    }
}
