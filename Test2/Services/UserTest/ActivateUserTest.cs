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

namespace Test2.Services.UserTest
{
    [TestFixture]
    public class ActivateUserTest
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
        public async Task Activate_User_SetsIsActiveTrue()
        {
            // Arrange
            var user = new User { Id = "user123", IsActive = false };
            _userRepoMock.Setup(r => r.FindById("user123")).ReturnsAsync(user);

            // Act
            await _userService.Activate("user123");

            // Assert
            Assert.IsTrue(user.IsActive);
            _userRepoMock.Verify(r => r.Update(user), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

    }
}
