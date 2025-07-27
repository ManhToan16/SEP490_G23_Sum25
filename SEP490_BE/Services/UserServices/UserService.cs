using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.AuthDTO;
using SEP490_BE.DTO.UserDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.RoleRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Services.AuthServices;

namespace SEP490_BE.Services.UserServices
{
    public class UserService : IUserService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IAuthService _authService;
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IAuditLogRepository _logRepository;

        public UserService(
            KhanhAnNeurologyClinicContext context,
            IAuthService authService, 
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IAuditLogRepository logRepository)
        {
            _context = context;
            _authService = authService;
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _logRepository = logRepository;


        }

        public async Task Activate(string id)
        {
            var user = await _userRepository.FindById(id);
            user.IsActive = true;
            await _userRepository.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task Deactivate(string id)
        {
            var user = await _userRepository.FindById(id);
            user.IsActive = false;
            await _userRepository.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<UserResponseDTO> Create(CreateUserDTO request)
        {
            if (await _userRepository.FindByPhoneNumber(request.PhoneNumber) != null)
            {
                throw new ConflictDataException(MessageConstants.PHONE_NUMBER_EXISTS);
            }
            if (await _userRepository.FindByEmail(request.Email) != null)
            {
                throw new ConflictDataException(MessageConstants.EMAIL_EXISTS);
            }
            if (!await _roleRepository.CheckRoleExist(request.Role)) {
                throw new ResourceNotFoundException(MessageConstants.ROLE_NOT_FOUND);
            }
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
            string newUserId = Guid.NewGuid().ToString();
            var user = new User
            {
                Id = newUserId,
                Name = request.Name,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                Password = hashedPassword,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                Address = request.Address,
                IsActive = true,
            };

            var userResponseDTO = new UserResponseDTO
            {
                Id = user.Id,
                Name = user.Name,
                PhoneNumber = user.PhoneNumber,
                Email = user.Email,
                Address = user.Address,
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth,
                IsActive = user.IsActive,
                Role = request.Role
            };

            var sessionUser = await _authService.GetAuthenticatedUser();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _userRepository.Insert(user);
                await _roleRepository.ApplyRole(newUserId, request.Role);
                await _logRepository.LogAsync(sessionUser.Id, "CREATE", "Users", newUserId, null, userResponseDTO);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return userResponseDTO;
        }

        public async Task Delete(string id)
        {
            var user = await _userRepository.FindById(id);
            if (user == null) { 
                throw new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND);
            }
            var sessionUser = await _authService.GetAuthenticatedUser();

            var userResponseDTO = new UserResponseDTO
            {
                Id = user.Id,
                Name = user.Name,
                PhoneNumber = user.PhoneNumber,
                Email = user.Email,
                Address = user.Address ?? "",
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth,
                IsActive = user.IsActive,
                Role = (await _roleRepository.FindRolesByUser(user.Id)).FirstOrDefault() ?? ""
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _logRepository.LogAsync(sessionUser.Id, "DELETE", "Users", user.Id, userResponseDTO, null);
                await _userRepository.Delete(user);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Pagination<UserResponseDTO>> GetAll(
            string? role,
            string? email,
            string? phoneNumber,
            string? name,
            int pageNumber,
            int pageSize)
        {
            var (users, totalItems) = await _userRepository.FindAll(role, email, phoneNumber, name, pageNumber, pageSize);
            return new Pagination<UserResponseDTO>
            {
                Items = users,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<UserResponseDTO> GetUserById(string id)
        {
            var user = await _userRepository.FindById(id);
            var role = await _roleRepository.FindRolesByUser(id);
            if (user == null)
            {
                throw new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND);
            }
            return new UserResponseDTO
            {
                Id = user.Id,
                Name = user.Name,
                PhoneNumber = user.PhoneNumber,
                Email = user.Email,
                Address = user.Address,
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth,
                IsActive = user.IsActive,
                Role = role[0]
            };
        }
        public async Task<List<UserResponseDTO>> GetUserByRole(string role)
        {
            var users = await _userRepository.FindByRole(role);
            if (users == null)
            {
                throw new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND);
            }
            var result = new List<UserResponseDTO>();

            foreach (var user in users)
            {
                var userRoles = await _roleRepository.FindRolesByUser(user.Id); 

                result.Add(new UserResponseDTO
                {
                    Id = user.Id,
                    Name = user.Name,
                    PhoneNumber = user.PhoneNumber,
                    Email = user.Email,
                    Address = user.Address,
                    Gender = user.Gender,
                    DateOfBirth = user.DateOfBirth,
                    IsActive = user.IsActive,
                    Role = role 
                });
            }

            return result;
        }

        public async Task<UserResponseDTO> Update(string id, UpdateUserDTO request)
        {
            var user = await _userRepository.FindById(id);
            if (user == null)
            {
                throw new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND);
            }
            var phoneUser = await _userRepository.FindByPhoneNumber(request.PhoneNumber);
            if (phoneUser != null && phoneUser.Id != id)
            {
                throw new ConflictDataException(MessageConstants.PHONE_NUMBER_EXISTS);
            }
            var emailUser = await _userRepository.FindByEmail(request.Email);
            if (emailUser != null && emailUser.Id != id)
            {
                throw new ConflictDataException(MessageConstants.EMAIL_EXISTS);
            }
            if (!await _roleRepository.CheckRoleExist(request.Role))
            {
                throw new ResourceNotFoundException(MessageConstants.ROLE_NOT_FOUND);
            }

            #region Check if the authenticated user is ADMIN to have permission to update the role
            var authenticatedUser = await _authService.GetAuthenticatedUser();
            var roleOfAuthenticatedUser = await _roleRepository.FindRolesByUser(authenticatedUser.Id);
            #endregion

            var oldRole = await _roleRepository.FindRolesByUser(user.Id);

            // Lưu lại thông tin cũ
            var oldData = new UserResponseDTO
            {
                Id = user.Id,
                Name = user.Name,
                PhoneNumber = user.PhoneNumber,
                Email = user.Email,
                Address = user.Address,
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth,
                IsActive = user.IsActive,
                Role = oldRole[0]
            };

            // Cập nhật dữ liệu mới
            user.Name = request.Name;
            user.Email = request.Email;
            user.PhoneNumber = request.PhoneNumber;
            user.Address = request.Address;
            user.Gender = request.Gender;
            user.DateOfBirth = request.DateOfBirth;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _userRepository.Update(user);
                if (roleOfAuthenticatedUser[0] == RoleConstants.Admin)
                {
                    await _roleRepository.ApplyRole(user.Id, request.Role);
                }
                await _context.SaveChangesAsync();

                var newRole = await _roleRepository.FindRolesByUser(user.Id);
                var newData = new UserResponseDTO
                {
                    Id = user.Id,
                    Name = user.Name,
                    PhoneNumber = user.PhoneNumber,
                    Email = user.Email,
                    Address = user.Address,
                    Gender = user.Gender,
                    DateOfBirth = user.DateOfBirth,
                    IsActive = user.IsActive,
                    Role = newRole[0]
                };

                await _logRepository.LogAsync(authenticatedUser.Id, "UPDATE", "Users", user.Id, oldData, newData);
                await transaction.CommitAsync();

                return newData;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
