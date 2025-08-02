using NUnit.Framework;
using Moq;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using StackExchange.Redis;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Threading.Tasks;
using SEP490_BE.Constants;
using SEP490_BE.DTO.AuthDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.RoleRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.EmailServices;

namespace Test2.Services.AuthTest
{

[TestFixture]
public class LogoutTest
{
    private Mock<IUserRepository> _userRepoMock;
    private Mock<IRoleRepository> _roleRepoMock;
    private Mock<IEmailService> _emailServiceMock;
    private Mock<IConnectionMultiplexer> _redisMock;
    private Mock<IWebHostEnvironment> _envMock;
    private Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private Mock<IConfiguration> _configMock;
    private Mock<IDatabase> _dbMock;

    private AuthService _authService;

    [SetUp]
    public void SetUp()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _roleRepoMock = new Mock<IRoleRepository>();
        _emailServiceMock = new Mock<IEmailService>();
        _redisMock = new Mock<IConnectionMultiplexer>();
        _envMock = new Mock<IWebHostEnvironment>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _configMock = new Mock<IConfiguration>();

        _dbMock = new Mock<IDatabase>();
        _redisMock.Setup(r => r.GetDatabase(It.IsAny<int>(), It.IsAny<object>())).Returns(_dbMock.Object);

        _configMock.Setup(c => c["Jwt:SecretKey"]).Returns("this_is_a_test_secret_key_123456");

        var dbContextMock = new Mock<KhanhAnNeurologyClinicContext>();

        _authService = new AuthService(
            dbContextMock.Object,
            _httpContextAccessorMock.Object,
            _configMock.Object,
            _roleRepoMock.Object,
            _userRepoMock.Object,
            _emailServiceMock.Object,
            _redisMock.Object,
            _envMock.Object
        );
    }

    private string GenerateValidToken(string userId)
    {
        var key = Encoding.UTF8.GetBytes("this_is_a_test_secret_key_123456");
        var claims = new[]
        {
            new Claim("UserId", userId)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [Test]
    public async Task Logout_ShouldSucceed_WhenTokenIsValidAndKeyExists()
    {
        // Arrange
        var userId = "user-1";
        var token = GenerateValidToken(userId);
        var deviceId = "device-1";
        var redisKey = $"refresh:{userId}:{deviceId}";

        _dbMock.Setup(x => x.KeyExistsAsync(redisKey, CommandFlags.None)).ReturnsAsync(true);
        _dbMock.Setup(x => x.KeyDeleteAsync(redisKey, CommandFlags.None)).ReturnsAsync(true);

        var request = new TokenRequestDTO
        {
            AccessToken = token,
            DeviceId = deviceId
        };

        // Act & Assert (no exception)
        Assert.DoesNotThrowAsync(async () => await _authService.Logout(request));
    }

    [Test]
    public void Logout_ShouldThrow_WhenTokenIsValidButKeyNotExists()
    {
        // Arrange
        var userId = "user-2";
        var token = GenerateValidToken(userId);
        var deviceId = "device-2";
        var redisKey = $"refresh:{userId}:{deviceId}";

        _dbMock.Setup(x => x.KeyExistsAsync(redisKey, CommandFlags.None)).ReturnsAsync(false);

        var request = new TokenRequestDTO
        {
            AccessToken = token,
            DeviceId = deviceId
        };

        // Act & Assert
        var ex = Assert.ThrowsAsync<UnauthenticatedException>(async () => await _authService.Logout(request));
        Assert.That(ex.Message, Is.EqualTo(MessageConstants.UNAUTHENTICATED_ERROR));
    }
}

}