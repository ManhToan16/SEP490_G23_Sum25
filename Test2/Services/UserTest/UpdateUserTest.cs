using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.Constants;
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

namespace Test2.Services.UserTest
{
    [TestFixture]
    public class UpdateUserTest
    {
        private Mock<IUserRepository> _userRepoMock = null!;
        private Mock<IRoleRepository> _roleRepoMock = null!;
        private Mock<IAuthService> _authServiceMock = null!;
        private Mock<IAuditLogRepository> _logRepoMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DatabaseFacade> _databaseMock = null!;
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

            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _databaseMock.Setup(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _userService = new UserService(
                _contextMock.Object,
                _authServiceMock.Object,
                _userRepoMock.Object,
                _roleRepoMock.Object,
                _logRepoMock.Object);
        }

        [Test]
        public async Task Update_ValidData_Success()
        {
            var userId = "user123";
            var request = new UpdateUserDTO
            {
                Name = "Updated Name",
                PhoneNumber = "0988888888",
                Email = "updated@example.com",
                Address = "Updated Address",
                Gender = "Female",
                DateOfBirth = new DateTime(1995, 1, 1),
                Role = RoleConstants.Doctor
            };

            var existingUser = new User
            {
                Id = userId,
                Name = "Old Name",
                PhoneNumber = "0123456789",
                Email = "old@example.com",
                Address = "Old Address",
                Gender = "Male",
                DateOfBirth = new DateTime(1990, 1, 1),
                IsActive = true
            };

            var adminUser = new User { Id = "admin1" };

            _userRepoMock.Setup(r => r.FindById(userId)).ReturnsAsync(existingUser);
            _userRepoMock.Setup(r => r.FindByPhoneNumber(request.PhoneNumber)).ReturnsAsync((User)null!);
            _userRepoMock.Setup(r => r.FindByEmail(request.Email)).ReturnsAsync((User)null!);
            _roleRepoMock.Setup(r => r.CheckRoleExist(request.Role)).ReturnsAsync(true);
            _authServiceMock.Setup(a => a.GetAuthenticatedUser()).ReturnsAsync(adminUser);
            _roleRepoMock.Setup(r => r.FindRolesByUser(adminUser.Id)).ReturnsAsync(new List<string> { RoleConstants.Admin });
            _roleRepoMock.Setup(r => r.FindRolesByUser(existingUser.Id)).ReturnsAsync(new List<string> { RoleConstants.Doctor });
            _userRepoMock.Setup(r => r.Update(existingUser)).Returns(Task.CompletedTask);
            _roleRepoMock.Setup(r => r.ApplyRole(userId, request.Role)).Returns(Task.CompletedTask);
            _roleRepoMock.Setup(r => r.FindRolesByUser(userId)).ReturnsAsync(new List<string> { RoleConstants.Doctor });
            _logRepoMock.Setup(r => r.LogAsync(adminUser.Id, "UPDATE", "Users", userId, It.IsAny<UserResponseDTO>(), It.IsAny<UserResponseDTO>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            var result = await _userService.Update(userId, request);

            Assert.That(result.Name, Is.EqualTo(request.Name));
            Assert.That(result.Email, Is.EqualTo(request.Email));
            Assert.That(result.Role, Is.EqualTo(request.Role));

            _userRepoMock.Verify(r => r.Update(existingUser), Times.Once);
            _roleRepoMock.Verify(r => r.ApplyRole(userId, request.Role), Times.Once);
            _logRepoMock.Verify(r => r.LogAsync(adminUser.Id, "UPDATE", "Users", userId, It.IsAny<UserResponseDTO>(), It.IsAny<UserResponseDTO>()), Times.Once);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
