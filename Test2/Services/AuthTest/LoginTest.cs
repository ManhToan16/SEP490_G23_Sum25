using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Moq;
using SEP490_BE.Constants;
using SEP490_BE.DTO.AuthDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.RoleRepositories;
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
    public class LoginTest
    {
        private Mock<IUserRepository> _userRepositoryMock;
        private Mock<IRoleRepository> _roleRepositoryMock;
        private Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private Mock<IEmailService> _emailServiceMock;
        private Mock<IConfiguration> _configurationMock;
        private Mock<IConnectionMultiplexer> _connectionMultiplexerMock;
        private Mock<IWebHostEnvironment> _webHostEnvironmentMock;
        private Mock<IDatabase> _redisMock;

        private AuthService _authService;

        [SetUp]
        public void Setup()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _roleRepositoryMock = new Mock<IRoleRepository>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _emailServiceMock = new Mock<IEmailService>();
            _configurationMock = new Mock<IConfiguration>();
            _connectionMultiplexerMock = new Mock<IConnectionMultiplexer>();
            _webHostEnvironmentMock = new Mock<IWebHostEnvironment>();
            _redisMock = new Mock<IDatabase>();

            _configurationMock.Setup(c => c["Jwt:SecretKey"]).Returns("super_secret_key_123456");

            _connectionMultiplexerMock.Setup(c => c.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
                .Returns(_redisMock.Object);

            _authService = new AuthService(
                context: null,
                httpContextAccessor: _httpContextAccessorMock.Object,
                configuration: _configurationMock.Object,
                roleRepository: _roleRepositoryMock.Object,
                userRepository: _userRepositoryMock.Object,
                emailService: _emailServiceMock.Object,
                redis: _connectionMultiplexerMock.Object,
                env: _webHostEnvironmentMock.Object
            );
        }

        [Test]
        public void Login_InvalidEmail_ThrowsUnauthenticatedException()
        {
            var request = new LoginRequestDTO { Email = "notfound@example.com", Password = "password", DeviceId = "dev1" };

            _userRepositoryMock.Setup(r => r.FindByEmail(request.Email)).ReturnsAsync((User)null);

            var ex = Assert.ThrowsAsync<UnauthenticatedException>(() => _authService.Login(request));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.INVALID_LOGIN));
        }

        [Test]
        public void Login_InvalidPassword_ThrowsUnauthenticatedException()
        {
            var user = new User { Email = "test@example.com", Password = BCrypt.Net.BCrypt.HashPassword("correct"), IsActive = true };
            var request = new LoginRequestDTO { Email = user.Email, Password = "wrong", DeviceId = "dev1" };

            _userRepositoryMock.Setup(r => r.FindByEmail(user.Email)).ReturnsAsync(user);

            var ex = Assert.ThrowsAsync<UnauthenticatedException>(() => _authService.Login(request));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.INVALID_LOGIN));
        }

        [Test]
        public void Login_InactiveUser_ThrowsUnauthorizedAccessException()
        {
            var user = new User { Email = "test@example.com", Password = BCrypt.Net.BCrypt.HashPassword("123456"), IsActive = false };
            var request = new LoginRequestDTO { Email = user.Email, Password = "123456", DeviceId = "dev1" };

            _userRepositoryMock.Setup(r => r.FindByEmail(user.Email)).ReturnsAsync(user);

            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.Login(request));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.FORBIDDEN));
        }


        [Test]
        public void Login_ValidPasswordAndEmail_ThrowsSucceed()
        {
            var user = new User { Email = "test@example.com", Password = BCrypt.Net.BCrypt.HashPassword("correct"), IsActive = true };
            var request = new LoginRequestDTO { Email = user.Email, Password = "wrong", DeviceId = "dev1" };

            _userRepositoryMock.Setup(r => r.FindByEmail(user.Email)).ReturnsAsync(user);

            var ex = Assert.ThrowsAsync<UnauthenticatedException>(() => _authService.Login(request));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.INVALID_LOGIN));
        }
    }

}
