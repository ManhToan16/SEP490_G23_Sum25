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
using SEP490_BE.Constants;
using SEP490_BE.Exceptions;

namespace Test2.Services.UserTest
{
    [TestFixture]
    public class GetUserTest
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
        public async Task GetUserById_ReturnsCorrectUser()
        {
            var userId = "u123";
            var user = new User
            {
                Id = userId,
                Name = "Jane",
                Email = "jane@example.com",
                PhoneNumber = "0987654321",
                Address = "456 Avenue",
                Gender = "Female",
                DateOfBirth = new DateTime(1985, 5, 5),
                IsActive = true
            };

            _userRepoMock.Setup(r => r.FindById(userId)).ReturnsAsync(user);
            _roleRepoMock.Setup(r => r.FindRolesByUser(userId)).ReturnsAsync(new List<string> { "Admin" });

            var result = await _userService.GetUserById(userId);

            Assert.AreEqual(userId, result.Id);
            Assert.AreEqual("Jane", result.Name);
            Assert.AreEqual("Admin", result.Role);
        }

        [Test]
        public void GetUserById_UserNotFound_ThrowsResourceNotFoundException()
        {
            var userId = "notfound";
            _userRepoMock.Setup(r => r.FindById(userId)).ReturnsAsync((User)null!);

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () => await _userService.GetUserById(userId));
            Assert.AreEqual(MessageConstants.USER_NOT_FOUND, ex!.Message);
        }
    }
}

