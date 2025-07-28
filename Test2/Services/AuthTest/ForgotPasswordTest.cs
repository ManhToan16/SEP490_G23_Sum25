using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using SEP490_BE.DTO.AuthDTO;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.EmailServices;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.AuthTest
{
    [TestFixture]
    public class ForgotPasswordTest
    {
        private Mock<IUserRepository> _userRepositoryMock;
        private Mock<IEmailService> _emailServiceMock;
        private Mock<IWebHostEnvironment> _envMock;
        private Mock<IConfiguration> _configurationMock;
        private Mock<IDatabase> _redisMock;
        private Mock<IConnectionMultiplexer> _connectionMultiplexerMock;
        private Mock<HttpContextAccessor> _httpContextAccessorMock;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock;

        private AuthService _authService;

        [SetUp]
        public void SetUp()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _emailServiceMock = new Mock<IEmailService>();
            _envMock = new Mock<IWebHostEnvironment>();
            _configurationMock = new Mock<IConfiguration>();
            _redisMock = new Mock<IDatabase>();
            _connectionMultiplexerMock = new Mock<IConnectionMultiplexer>();
            _httpContextAccessorMock = new Mock<HttpContextAccessor>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>();

            _configurationMock.Setup(c => c["App:BackendUrl"]).Returns("https://localhost:5001");
            _connectionMultiplexerMock.Setup(c => c.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
                                      .Returns(_redisMock.Object);

            _authService = new AuthService(
                _contextMock.Object,
                _httpContextAccessorMock.Object,
                _configurationMock.Object,
                null!,
                _userRepositoryMock.Object,
                _emailServiceMock.Object,
                _connectionMultiplexerMock.Object,
                _envMock.Object
            );
        }

        [Test]
        public async Task ForgotPassword_ValidEmail_SendsResetEmail()
        {
            // Arrange
            var email = "test@example.com";
            var userId = "user123";
            var user = new User { Id = userId, Email = email };
            var request = new ForgotPasswordDTO { Email = email };

            _userRepositoryMock.Setup(r => r.FindByEmail(email)).ReturnsAsync(user);
            _redisMock.Setup(r => r.StringSetAsync(
                It.IsAny<RedisKey>(),
                It.IsAny<RedisValue>(),
                It.IsAny<TimeSpan>(),
                It.IsAny<When>(),
                It.IsAny<CommandFlags>()
                )).ReturnsAsync(true);
            _envMock.Setup(e => e.ContentRootPath).Returns(Directory.GetCurrentDirectory());
            _emailServiceMock.Setup(e => e.SendAsync(email, It.IsAny<string>(), It.IsAny<string>())).Returns(Task.CompletedTask);

            var htmlPath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "reset-password-email.html");
            Directory.CreateDirectory(Path.GetDirectoryName(htmlPath)!);
            await File.WriteAllTextAsync(htmlPath, "Click here: {{link}}");

            // Act
            await _authService.ForgotPassword(request);

            // Assert
            _emailServiceMock.Verify(e => e.SendAsync(email, It.IsAny<string>(), It.Is<string>(s => s.Contains("Click here"))), Times.Once);
        }

        [Test]
        public async Task ResetPassword_ValidTokenAndPassword_ChangesPassword()
        {
            // Arrange
            var token = Guid.NewGuid().ToString();
            var userId = "user123";
            var newPassword = "newStrongPassword123";
            var key = $"forgot:{token}";

            var user = new User { Id = userId, Password = BCrypt.Net.BCrypt.HashPassword("oldpass") };

            _redisMock.Setup(r => r.StringGetAsync(key, CommandFlags.None)).ReturnsAsync(userId);
            _userRepositoryMock.Setup(r => r.FindById(userId)).ReturnsAsync(user);
            _userRepositoryMock.Setup(r => r.Update(user)).Returns(Task.CompletedTask);
            _contextMock.Setup(c => c.SaveChangesAsync(default)).ReturnsAsync(1);
            _redisMock.Setup(r => r.KeyDeleteAsync(key, CommandFlags.None)).ReturnsAsync(true);

            // Act
            await _authService.ResetPassword(token, newPassword);

            // Assert
            Assert.That(BCrypt.Net.BCrypt.Verify(newPassword, user.Password), Is.True);
        }

        //[Test]
        //public async Task ChangePassword_CorrectOldPassword_ChangesSuccessfully()
        //{
        //    // Arrange
        //    var userId = "user123";
        //    var oldPassword = "oldpass";
        //    var newPassword = "newStrongPass123";

        //    var user = new User { Id = userId, Password = BCrypt.Net.BCrypt.HashPassword(oldPassword) };

        //    var authService = new Mock<AuthService>(_contextMock.Object,
        //                                            _httpContextAccessorMock.Object,
        //                                            _configurationMock.Object,
        //                                            null!,
        //                                            _userRepositoryMock.Object,
        //                                            _emailServiceMock.Object,
        //                                            _connectionMultiplexerMock.Object,
        //                                            _envMock.Object)
        //    {
        //        CallBase = true
        //    };

        //    authService.Setup(a => a.GetAuthenticatedUser()).ReturnsAsync(user);
        //    _userRepositoryMock.Setup(r => r.Update(user)).Returns(Task.CompletedTask);
        //    _contextMock.Setup(c => c.SaveChangesAsync(default)).ReturnsAsync(1);

        //    // Act
        //    await authService.Object.ChangePassword(new ChangePasswordDTO
        //    {
        //        OldPassword = oldPassword,
        //        Password = newPassword
        //    });

        //    // Assert
        //    Assert.That(BCrypt.Net.BCrypt.Verify(newPassword, user.Password), Is.True);
        //}
    }

}
