using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SEP490_BE.Constants;
using SEP490_BE.DTO.AuthDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.RoleRepositories;
using SEP490_BE.Repositories.UserRepositories;
using StackExchange.Redis;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace SEP490_BE.Services.AuthServices
{
    public class AuthService : IAuthService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IRoleRepository _roleRepository;
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;
        private readonly IDatabase _redis;

        public AuthService(
            KhanhAnNeurologyClinicContext context,
            IHttpContextAccessor httpContextAccessor,
            IConfiguration configuration,
            IRoleRepository roleRepository,
            IUserRepository userRepository,
            IConnectionMultiplexer redis)
        {
            _context = context;
            _configuration = configuration;
            _userRepository = userRepository;
            _httpContextAccessor = httpContextAccessor;
            _roleRepository = roleRepository;
            _redis = redis.GetDatabase();
        }

        public async Task<TokenResponseDTO> Login(LoginRequestDTO request)
        {
            var user = await _userRepository.FindByPhoneNumber(request.PhoneNumber);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                throw new UnauthenticatedException(MessageConstants.INVALID_LOGIN);
            }
            return await GenerateToken(user, request.DeviceId);
        }

        private async Task<TokenResponseDTO> GenerateToken(User user, string deviceId)
        {
            var userRoles = await _roleRepository.FindRolesByUser(user.Id);
            var userPermissions = new HashSet<string>();
            foreach (var role in userRoles)
            {
                var rolePermissions = await _roleRepository.FindPermissionsByRole(role);
                foreach (var permission in rolePermissions)
                {
                    userPermissions.Add(permission); 
                }
            }

            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var secretKeyBytes = Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(JwtRegisteredClaimNames.Sub, user.PhoneNumber),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("UserId", user.Id.ToString())
            };

            #region Claim Roles
            foreach (var role in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
            #endregion

            #region Claim Permissions
            var permissionsString = string.Join(" ", userPermissions);
            claims.Add(new Claim("Permissions", permissionsString));
            #endregion

            var tokenDescription = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(secretKeyBytes),
                    SecurityAlgorithms.HmacSha256
                )
            };

            var token = jwtTokenHandler.CreateToken(tokenDescription);
            var accessToken = jwtTokenHandler.WriteToken(token);

            var refreshToken = GenerateRefreshToken();
            var redisKey = $"refresh:{user.Id}:{deviceId}";

            var redisValue = JsonSerializer.Serialize(new
            {
                JwtId = token.Id,
                RefreshToken = refreshToken
            });

            await _redis.StringSetAsync(redisKey, redisValue, TimeSpan.FromDays(7));

            return new TokenResponseDTO
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiresAt = token.ValidTo
            };
        }

        private string GenerateRefreshToken()
        {
            var random = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(random);
                return Convert.ToBase64String(random);
            }
        }

        public async Task<TokenResponseDTO> RefreshToken(TokenRequestDTO request)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKeyBytes = Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]);
            var validationParams = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(secretKeyBytes),
                ClockSkew = TimeSpan.Zero,
                ValidateLifetime = false
            };
            var principal = tokenHandler.ValidateToken(request.AccessToken, validationParams, out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwtToken ||
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new UnauthenticatedException(MessageConstants.INVALID_TOKEN);
            }

            var userId = principal.FindFirst("UserId")?.Value;
            var jti = principal.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            var key = $"refresh:{userId}:{request.DeviceId}";

            var value = await _redis.StringGetAsync(key);
            if (value.IsNullOrEmpty)
            {
                throw new UnauthenticatedException(MessageConstants.INVALID_TOKEN);
            }

            var saved = JsonSerializer.Deserialize<RedisValueDTO>(value!);
            if (saved == null || saved.RefreshToken != request.RefreshToken || saved.JwtId != jti)
            {
                throw new UnauthenticatedException(MessageConstants.INVALID_TOKEN);
            }
            await _redis.KeyDeleteAsync(key);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            return await GenerateToken(user!, request.DeviceId);
        }

        public async Task<User> GetAuthenticatedUser()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null || context.User == null || !context.User.Identity.IsAuthenticated)
            {
                throw new UnauthenticatedException(MessageConstants.UNAUTHENTICATED_ERROR);
            }
            var userId = context.User.FindFirst("UserId")?.Value;
            var user = await _userRepository.FindById(userId);
            if (user == null || user.IsActive == false)
            {
                throw new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND);
            }
            return user;
        }

        public async Task Logout(TokenRequestDTO request)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKeyBytes = Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]);
            var validationParams = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(secretKeyBytes),
                ValidateLifetime = false, 
                ClockSkew = TimeSpan.Zero
            };
            try
            {
                var principal = tokenHandler.ValidateToken(request.AccessToken, validationParams, out var validatedToken);
                var userId = principal.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    throw new UnauthenticatedException(MessageConstants.UNAUTHENTICATED_ERROR);
                }
                var redisKey = $"refresh:{userId}:{request.DeviceId}";
                await _redis.KeyDeleteAsync(redisKey);
            }
            catch (SecurityTokenException)
            {
                throw new UnauthenticatedException(MessageConstants.UNAUTHENTICATED_ERROR);
            }
        }

        public Task ForgotPassword()
        {
            throw new NotImplementedException();
        }
        public Task ChangePassword()
        {
            throw new NotImplementedException();
        }

    }
}
