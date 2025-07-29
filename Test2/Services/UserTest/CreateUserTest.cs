using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.DTO.UserDTO;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.RoleRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.UserServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SEP490_BE.Constants;
using SEP490_BE.Exceptions;

namespace Test2.Services.UserTest
{
    [TestFixture]
    public class CreateUser
    {
        private Mock<IUserRepository> _userRepoMock = null!;
        private Mock<IRoleRepository> _roleRepoMock = null!;
        private Mock<IAuthService> _authServiceMock = null!;
        private Mock<IAuditLogRepository> _logRepoMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DatabaseFacade> _dbMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;
        private UserService _userService = null!;

        [SetUp]
        public void SetUp()
        {
            _userRepoMock = new Mock<IUserRepository>();
            _roleRepoMock = new Mock<IRoleRepository>();
            _authServiceMock = new Mock<IAuthService>();
            _logRepoMock = new Mock<IAuditLogRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>(new DbContextOptions<KhanhAnNeurologyClinicContext>());

            _dbMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();
            _dbMock.Setup(db => db.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_dbMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _userService = new UserService(
                _contextMock.Object,
                _authServiceMock.Object,
                _userRepoMock.Object,
                _roleRepoMock.Object,
                _logRepoMock.Object
            );
        }

        [Test]
        public async Task Create_ValidUser_ReturnsUserResponse()
        {
            // Arrange
            var request = new CreateUserDTO
            {
                Name = "Test User",
                Email = "test@example.com",
                PhoneNumber = "0123456789",
                Password = "Test@1234",
                Role = "Admin",
                Address = "123 Street",
                DateOfBirth = new DateTime(1990, 1, 1),
                Gender = "Male"
            };

            _userRepoMock.Setup(r => r.FindByPhoneNumber(request.PhoneNumber)).ReturnsAsync((User?)null);
            _userRepoMock.Setup(r => r.FindByEmail(request.Email)).ReturnsAsync((User?)null);
            _roleRepoMock.Setup(r => r.CheckRoleExist(request.Role)).ReturnsAsync(true);
            _authServiceMock.Setup(s => s.GetAuthenticatedUser()).ReturnsAsync(new User { Id = "admin-id" });

            _userRepoMock.Setup(r => r.Insert(It.IsAny<User>())).Returns(Task.CompletedTask);
            _roleRepoMock.Setup(r => r.ApplyRole(It.IsAny<string>(), request.Role)).Returns(Task.CompletedTask);
            _logRepoMock.Setup(r => r.LogAsync(It.IsAny<string>(), "CREATE", "Users", It.IsAny<string>(), null, It.IsAny<object>())).Returns(Task.CompletedTask);

            // Act
            var result = await _userService.Create(request);

            // Assert
            Assert.NotNull(result);
            Assert.AreEqual(request.Email, result.Email);
            Assert.AreEqual(request.PhoneNumber, result.PhoneNumber);
            Assert.AreEqual(request.Role, result.Role);

            _userRepoMock.Verify(r => r.Insert(It.Is<User>(u => u.Email == request.Email)), Times.Once);
            _roleRepoMock.Verify(r => r.ApplyRole(It.IsAny<string>(), request.Role), Times.Once);
            _logRepoMock.Verify(r => r.LogAsync("admin-id", "CREATE", "Users", It.IsAny<string>(), null, It.IsAny<object>()), Times.Once);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public void Create_DuplicatePhoneNumber_ThrowsConflictException()
        {
            var request = new CreateUserDTO
            {
                Name = "User",
                PhoneNumber = "0123456789",
                Email = "new@example.com",
                Password = "Pass1234",
                Role = "Doctor"
            };

            _userRepoMock.Setup(r => r.FindByPhoneNumber(request.PhoneNumber))
                .ReturnsAsync(new User { Id = "existing-id" });

            var ex = Assert.ThrowsAsync<ConflictDataException>(() => _userService.Create(request));
            Assert.AreEqual(MessageConstants.PHONE_NUMBER_EXISTS, ex.Message);
        }


        [Test]
        public void Create_DuplicateEmail_ThrowsConflictException()
        {
            var request = new CreateUserDTO
            {
                Name = "User",
                PhoneNumber = "0999999999",
                Email = "exist@example.com",
                Password = "Pass1234",
                Role = "Doctor"
            };

            _userRepoMock.Setup(r => r.FindByPhoneNumber(request.PhoneNumber)).ReturnsAsync((User?)null);
            _userRepoMock.Setup(r => r.FindByEmail(request.Email))
                .ReturnsAsync(new User { Id = "existing-email-id" });

            var ex = Assert.ThrowsAsync<ConflictDataException>(() => _userService.Create(request));
            Assert.AreEqual(MessageConstants.EMAIL_EXISTS, ex.Message);
        }

        [Test]
        public void Create_RoleNotExist_ThrowsResourceNotFoundException()
        {
            var request = new CreateUserDTO
            {
                Name = "User",
                PhoneNumber = "0888888888",
                Email = "user@example.com",
                Password = "Pass1234",
                Role = "InvalidRole"
            };

            _userRepoMock.Setup(r => r.FindByPhoneNumber(request.PhoneNumber)).ReturnsAsync((User?)null);
            _userRepoMock.Setup(r => r.FindByEmail(request.Email)).ReturnsAsync((User?)null);
            _roleRepoMock.Setup(r => r.CheckRoleExist(request.Role)).ReturnsAsync(false);

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _userService.Create(request));
            Assert.AreEqual(MessageConstants.ROLE_NOT_FOUND, ex.Message);
        }
    }
}