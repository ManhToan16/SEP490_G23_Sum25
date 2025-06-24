using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.AuthDTO;
using SEP490_BE.DTO.UserDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.RoleRepositories;
using SEP490_BE.Repositories.UserRepositories;

namespace SEP490_BE.Services.UserServices
{
    public class UserService : IUserService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;

        public UserService(
            KhanhAnNeurologyClinicContext context,
            IUserRepository userRepository,
            IRoleRepository roleRepository)
        {
            _context = context;
            _userRepository = userRepository;
            _roleRepository = roleRepository;
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
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _userRepository.Insert(user);
                await _roleRepository.ApplyRole(newUserId, request.Role);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return new UserResponseDTO
            {
                Id = user.Id,
                Name = user.Name,
                PhoneNumber = user.PhoneNumber,
                Email = user.Email,
                Address = user.Address,
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth
            };
        }

        public async Task Delete(string id)
        {
            var user = await _userRepository.FindById(id);
            if (user == null) { 
                throw new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND);
            }
            await _userRepository.Delete(user);
            await _context.SaveChangesAsync();
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
                Items = users.Select(user => new UserResponseDTO
                {
                    Id = user.Id,
                    Name = user.Name,
                    PhoneNumber = user.PhoneNumber,
                    Email = user.Email,
                    Address = user.Address,
                    Gender = user.Gender,
                    DateOfBirth = user.DateOfBirth,
                }).ToList(),
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<UserResponseDTO> GetUserById(string id)
        {
            var user = await _userRepository.FindById(id);
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
                DateOfBirth = user.DateOfBirth
            };
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
                await _roleRepository.ApplyRole(user.Id, request.Role);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
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
            };
        }


    }
}
