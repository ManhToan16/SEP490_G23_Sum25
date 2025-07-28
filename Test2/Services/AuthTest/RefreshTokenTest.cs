//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.Configuration;
//using Microsoft.IdentityModel.Tokens;
//using Moq;
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
//using System.Text.Json;
//using System.Threading.Tasks;

//namespace Test2.Services.AuthTest
//{
//    [TestFixture]
//    public class RefreshTokenTest
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

//            var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
//                .UseInMemoryDatabase(databaseName: "TestDb")
//                .Options;
//            _context = new KhanhAnNeurologyClinicContext(options);

//            _configurationMock.Setup(c => c["Jwt:SecretKey"]).Returns("this_is_a_super_long_secret_key_1234567890!");
//            _connectionMultiplexerMock.Setup(c => c.GetDatabase(It.IsAny<int>(), It.IsAny<object>())).Returns(_redisMock.Object);

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
//        public async Task RefreshToken_ValidTokenAndRefreshToken_ReturnsNewTokens()
//        {
//            // Arrange
//            var userId = "123";
//            var jti = "test-jti-id";
//            var refreshToken = "test-refresh-token";
//            var deviceId = "device-1";

//            var jwtHandler = new JwtSecurityTokenHandler();
//            var secretKey = Encoding.UTF8.GetBytes("this_is_a_super_long_secret_key_1234567890!");
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

//            var token = jwtHandler.CreateToken(tokenDescriptor);
//            var accessToken = jwtHandler.WriteToken(token);

//            var redisData = new
//            {
//                JwtId = jti,
//                RefreshToken = refreshToken
//            };

//            var redisValue = JsonSerializer.Serialize(redisData);
//            _redisMock.Setup(r => r.StringGetAsync($"refresh:{userId}:{deviceId}", CommandFlags.None))
//                      .ReturnsAsync(redisValue);
//            _redisMock.Setup(r => r.KeyDeleteAsync($"refresh:{userId}:{deviceId}", CommandFlags.None))
//                      .ReturnsAsync(true);

//            _context.Users.Add(new User
//            {
//                Id = userId,
//                Name = "John",
//                Email = "john@example.com",
//                Password = "hashed",
//                PhoneNumber = "0123456789",
//                IsActive = true
//            });
//            await _context.SaveChangesAsync();

//            var request = new TokenRequestDTO
//            {
//                AccessToken = accessToken,
//                RefreshToken = refreshToken,
//                DeviceId = deviceId
//            };

//            // Act
//            var result = await _authService.RefreshToken(request);

//            // Assert
//            Assert.IsNotNull(result);
//            Assert.IsNotEmpty(result.AccessToken);
//            Assert.IsNotEmpty(result.RefreshToken);
//        }

//        [Test]
//        public void RefreshToken_InvalidAccessToken_ThrowsUnauthenticatedException()
//        {
//            // Arrange
//            var request = new TokenRequestDTO
//            {
//                AccessToken = "invalid.token.value",
//                RefreshToken = "some-refresh",
//                DeviceId = "dev"
//            };

//            // Act & Assert
//            var ex = Assert.ThrowsAsync<UnauthenticatedException>(async () =>
//                await _authService.RefreshToken(request));

//            Assert.That(ex.Message, Is.EqualTo("Token không hợp lệ"));
//        }

//        [Test]
//        public void RefreshToken_TokenNotFoundInRedis_ThrowsUnauthenticatedException()
//        {
//            // Arrange
//            var jwtHandler = new JwtSecurityTokenHandler();
//            var tokenDescriptor = new SecurityTokenDescriptor
//            {
//                Subject = new ClaimsIdentity(new[] {
//                new Claim("UserId", "123"),
//                new Claim(JwtRegisteredClaimNames.Jti, "jti-123")
//            }),
//                Expires = DateTime.UtcNow.AddMinutes(30),
//                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes("this_is_a_super_long_secret_key_1234567890!")), SecurityAlgorithms.HmacSha256)
//            };

//            var token = jwtHandler.CreateToken(tokenDescriptor);
//            var accessToken = jwtHandler.WriteToken(token);

//            _redisMock.Setup(r => r.StringGetAsync(It.IsAny<RedisKey>(), CommandFlags.None))
//                      .ReturnsAsync(RedisValue.Null);

//            var request = new TokenRequestDTO
//            {
//                AccessToken = accessToken,
//                RefreshToken = "not-used",
//                DeviceId = "dev"
//            };

//            // Act & Assert
//            var ex = Assert.ThrowsAsync<UnauthenticatedException>(async () =>
//                await _authService.RefreshToken(request));

//            Assert.That(ex.Message, Is.EqualTo("Token không hợp lệ"));
//        }
//    }
//}
