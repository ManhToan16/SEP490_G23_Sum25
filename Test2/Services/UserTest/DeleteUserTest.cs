using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Moq;
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
using SEP490_BE.DTO.UserDTO;
using SEP490_BE.Constants;
using SEP490_BE.Exceptions;

namespace Test2.Services.UserTest
{
    [TestFixture]
    public class DeleteUserTest
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
        public async Task Delete_UserExists_DeletesSuccessfully()
        {
            // Arrange
            var userId = "user123";
            var user = new User
            {
                Id = userId,
                Name = "John",
                PhoneNumber = "0123456789",
                Email = "john@example.com",
                Address = "123 Street",
                Gender = "Male",
                DateOfBirth = new DateTime(1990, 1, 1),
                IsActive = true
            };

            var sessionUser = new User { Id = "admin1" };

            _userRepoMock.Setup(r => r.FindById(userId)).ReturnsAsync(user);
            _authServiceMock.Setup(s => s.GetAuthenticatedUser()).ReturnsAsync(sessionUser);
            _roleRepoMock.Setup(r => r.FindRolesByUser(userId)).ReturnsAsync(new List<string> { "Doctor" });
            _logRepoMock.Setup(l => l.LogAsync(sessionUser.Id, "DELETE", "Users", user.Id, It.IsAny<object>(), null)).Returns(Task.CompletedTask);
            _userRepoMock.Setup(r => r.Delete(user)).Returns(Task.CompletedTask);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
            _dbMock.Setup(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            // Act
            await _userService.Delete(userId);

            // Assert
            _userRepoMock.Verify(r => r.Delete(user), Times.Once);
            _logRepoMock.Verify(l => l.LogAsync(sessionUser.Id, "DELETE", "Users", user.Id, It.IsAny<UserResponseDTO>(), null), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        [Test]
        public void Delete_UserNotFound_ThrowsResourceNotFoundException()
        {
            // Arrange
            var userId = "notfound123";
            _userRepoMock.Setup(r => r.FindById(userId)).ReturnsAsync((User)null!);

            // Act + Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () => await _userService.Delete(userId));
            Assert.AreEqual(MessageConstants.USER_NOT_FOUND, ex!.Message);

            _userRepoMock.Verify(r => r.Delete(It.IsAny<User>()), Times.Never);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

    }
}
