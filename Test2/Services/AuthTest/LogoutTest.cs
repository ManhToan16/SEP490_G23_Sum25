//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.Configuration;
//using Microsoft.IdentityModel.Tokens;
//using Moq;
//using SEP490_BE.Constants;
//using SEP490_BE.DTO.AuthDTO;
//using SEP490_BE.Entities;
//using SEP490_BE.Exceptions;
//using SEP490_BE.Services.AuthServices;
//using StackExchange.Redis;
//using System;
//using System.Collections.Generic;
//using System.IdentityModel.Tokens.Jwt;
//using System.Linq;
//using System.Security.Claims;
//using System.Text;
//using System.Threading.Tasks;

//namespace Test2.Services.AuthTest
//{
//    [TestFixture]
//    public class LogoutTest
//    {
//        private AuthService _authService;
//        private Mock<IConfiguration> _configurationMock;
//        private Mock<IDatabase> _redisMock;
//        private Mock<IConnectionMultiplexer> _connectionMultiplexerMock;
//        private KhanhAnNeurologyClinicContext _context;

//        [SetUp]
//        public void SetUp()
//        {
//            _configurationMock = new Mock<IConfiguration>();
//            _redisMock = new Mock<IDatabase>();
//            _connectionMultiplexerMock = new Mock<IConnectionMultiplexer>();

//            _configurationMock.Setup(c => c["Jwt:SecretKey"]).Returns("super_secret_key_123456");
//            _connectionMultiplexerMock.Setup(c => c.GetDatabase(It.IsAny<int>(), It.IsAny<object>())).Returns(_redisMock.Object);

//            _context = new KhanhAnNeurologyClinicContext(new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
//                .UseInMemoryDatabase("LogoutTestDb")
//                .Options);

//            _authService = new AuthService(
//                _context,
//                null!,
//                _configurationMock.Object,
//                null!,
//                null!,
//                null!,
//                _connectionMultiplexerMock.Object,
//                null!
//            );
//        }

//        [Test]
//        public async Task Logout_ValidToken_DeletesRedisKey()
//        {
//            // Arrange
//            var userId = "123";
//            var deviceId = "deviceX";
//            var jti = Guid.NewGuid().ToString();

//            var tokenHandler = new JwtSecurityTokenHandler();
//            var secretKey = Encoding.UTF8.GetBytes("super_secret_key_123456");
//            var tokenDescriptor = new SecurityTokenDescriptor
//            {
//                Subject = new ClaimsIdentity(new[]
//                {
//                new Claim("UserId", userId),
//                new Claim(JwtRegisteredClaimNames.Jti, jti)
//            }),
//                Expires = DateTime.UtcNow.AddMinutes(30),
//                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256)
//            };

//            var token = tokenHandler.CreateToken(tokenDescriptor);
//            var accessToken = tokenHandler.WriteToken(token);

//            var redisKey = $"refresh:{userId}:{deviceId}";

//            _redisMock.Setup(r => r.KeyExistsAsync(redisKey, CommandFlags.None)).ReturnsAsync(true);
//            _redisMock.Setup(r => r.KeyDeleteAsync(redisKey, CommandFlags.None)).ReturnsAsync(true);

//            var request = new TokenRequestDTO
//            {
//                AccessToken = accessToken,
//                RefreshToken = "dummy", // not used in logout
//                DeviceId = deviceId
//            };

//            // Act
//            await _authService.Logout(request);

//            // Assert
//            _redisMock.Verify(r => r.KeyDeleteAsync(redisKey, CommandFlags.None), Times.Once);
//        }

//        [Test]
//        public void Logout_InvalidAccessToken_ThrowsUnauthenticatedException()
//        {
//            // Arrange
//            var request = new TokenRequestDTO
//            {
//                AccessToken = "invalid.token",
//                RefreshToken = "x",
//                DeviceId = "d1"
//            };

//            // Act & Assert
//            var ex = Assert.ThrowsAsync<UnauthenticatedException>(async () => await _authService.Logout(request));
//            Assert.That(ex.Message, Is.EqualTo(MessageConstants.UNAUTHENTICATED_ERROR));
//        }

//        [Test]
//        public void Logout_MissingUserIdClaim_ThrowsUnauthenticatedException()
//        {
//            // Arrange
//            var tokenHandler = new JwtSecurityTokenHandler();
//            var secretKey = Encoding.UTF8.GetBytes("super_secret_key_123456");

//            var tokenDescriptor = new SecurityTokenDescriptor
//            {
//                Subject = new ClaimsIdentity(new[]
//                {
//                new Claim("custom-claim", "value")
//            }),
//                Expires = DateTime.UtcNow.AddMinutes(5),
//                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256)
//            };

//            var token = tokenHandler.CreateToken(tokenDescriptor);
//            var accessToken = tokenHandler.WriteToken(token);

//            var request = new TokenRequestDTO
//            {
//                AccessToken = accessToken,
//                RefreshToken = "dummy",
//                DeviceId = "d1"
//            };

//            // Act & Assert
//            var ex = Assert.ThrowsAsync<UnauthenticatedException>(async () => await _authService.Logout(request));
//            Assert.That(ex.Message, Is.EqualTo(MessageConstants.UNAUTHENTICATED_ERROR));
//        }

//        [Test]
//        public void Logout_KeyNotExistsInRedis_ThrowsUnauthenticatedException()
//        {
//            // Arrange
//            var userId = "456";
//            var deviceId = "dev2";
//            var jti = Guid.NewGuid().ToString();

//            var tokenHandler = new JwtSecurityTokenHandler();
//            var secretKey = Encoding.UTF8.GetBytes("super_secret_key_123456");

//            var tokenDescriptor = new SecurityTokenDescriptor
//            {
//                Subject = new ClaimsIdentity(new[]
//                {
//                new Claim("UserId", userId),
//                new Claim(JwtRegisteredClaimNames.Jti, jti)
//            }),
//                Expires = DateTime.UtcNow.AddMinutes(10),
//                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256)
//            };

//            var token = tokenHandler.CreateToken(tokenDescriptor);
//            var accessToken = tokenHandler.WriteToken(token);
//            var redisKey = $"refresh:{userId}:{deviceId}";

//            _redisMock.Setup(r => r.KeyExistsAsync(redisKey, CommandFlags.None)).ReturnsAsync(false);

//            var request = new TokenRequestDTO
//            {
//                AccessToken = accessToken,
//                RefreshToken = "xx",
//                DeviceId = deviceId
//            };

//            // Act & Assert
//            var ex = Assert.ThrowsAsync<UnauthenticatedException>(async () => await _authService.Logout(request));
//            Assert.That(ex.Message, Is.EqualTo(MessageConstants.UNAUTHENTICATED_ERROR));
//        }
//    }

//}
