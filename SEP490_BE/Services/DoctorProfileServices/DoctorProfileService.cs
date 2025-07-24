using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.DoctorProfileRepositories;
using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.Services.FileServices;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Services.AuthServices;

namespace SEP490_BE.Services.DoctorProfileServices
{
    public class DoctorProfileService : IDoctorProfileService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IDoctorProfileRepository _doctorProfileRepository;
        private readonly IFileService _fileService;
        private readonly IConfiguration _configuration;
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly IAuthService _authService;
        private readonly ILogger<DoctorProfileService> _logger;

        public DoctorProfileService(
            KhanhAnNeurologyClinicContext context,
            IDoctorProfileRepository doctorProfileRepository,
            IFileService fileService,
            IConfiguration configuration,IAuditLogRepository auditLogRepository,IAuthService authService, ILogger<DoctorProfileService> logger)
        {
            _context = context;
            _doctorProfileRepository = doctorProfileRepository;
            _fileService = fileService;
            _configuration = configuration;
            _auditLogRepository = auditLogRepository;
            _authService = authService;
            _logger = logger;
        }

        public async Task<Pagination<DoctorProfileResponseDTO>> GetAll(
            string? qualifications,
            int? minYearsOfExperience,
            int? maxYearsOfExperience,
            int pageNumber,
            int pageSize)
        {
            var (doctorProfiles, totalItems) = await _doctorProfileRepository.FindAll(qualifications, minYearsOfExperience, maxYearsOfExperience, pageNumber, pageSize);
            return new Pagination<DoctorProfileResponseDTO>
            {
                Items = doctorProfiles.Select(dp => new DoctorProfileResponseDTO
                {
                    Id = dp.Id,
                    DoctorId = dp.DoctorId,
                    Qualifications = dp.Qualifications,
                    YearsOfExperience = dp.YearsOfExperience,
                    Biography = dp.Biography,
                    Avatar = dp.Avatar,
                     Name = dp.Doctor?.Name,
                    PhoneNumber = dp.Doctor?.PhoneNumber,
                    Email = dp.Doctor?.Email,
                    DateOfBirth = dp.Doctor?.DateOfBirth
                }).ToList(),
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<DoctorProfileResponseDTO> GetById(string id)
        {
            var doctorProfile = await _doctorProfileRepository.FindByDoctorIdAsync(id);
            if (doctorProfile == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy hồ sơ bác sĩ");
            }
            return new DoctorProfileResponseDTO
            {
                Id = doctorProfile.Id,
                DoctorId = doctorProfile.DoctorId,
                Qualifications = doctorProfile.Qualifications,
                YearsOfExperience = doctorProfile.YearsOfExperience,
                Biography = doctorProfile.Biography,
                Avatar = doctorProfile.Avatar,
                Name = doctorProfile.Doctor?.Name,
                PhoneNumber = doctorProfile.Doctor?.PhoneNumber,
                Email = doctorProfile.Doctor?.Email,
                DateOfBirth = doctorProfile.Doctor?.DateOfBirth
            };
        }

        public async Task<DoctorProfileResponseDTO> Create(CreateDoctorProfileDTO request)
        {
            var existingProfile = await _doctorProfileRepository.FindByDoctorIdAsync(request.DoctorId);
            if (existingProfile != null)
            {
                throw new ConflictDataException("Bác sĩ đã có hồ sơ rồi.");
            }

            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == request.DoctorId)
                .ToListAsync();
            if (userRoles == null || !userRoles.Any(ur => ur.RoleName == "DOCTOR"))
            {
                throw new UnauthorizedAccessException("Chỉ những người dùng có vai trò BÁC SĨ mới được có hồ sơ.");
            }

            var user = await _context.Users.FindAsync(request.DoctorId);
            if (user == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy bác sĩ.");
            }

            var doctorProfile = new DoctorProfile
            {
                Id = Guid.NewGuid().ToString(),
                DoctorId = request.DoctorId,
                Qualifications = request.Qualifications,
                YearsOfExperience = request.YearsOfExperience,
                Biography = request.Biography,
                Avatar = request.Avatar
            };
            var sessionUser = await _authService.GetAuthenticatedUser();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _doctorProfileRepository.InsertAsync(doctorProfile);
                await _context.SaveChangesAsync();
                await _auditLogRepository.LogAsync(
    userId: sessionUser.Id,
    action: "CREATE",
    tableName: "DoctorProfiles",
    recordId: doctorProfile.Id,
    oldData: null,
    newData: doctorProfile
);
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new DoctorProfileResponseDTO
            {
                Id = doctorProfile.Id,
                DoctorId = doctorProfile.DoctorId,
                Qualifications = doctorProfile.Qualifications,
                YearsOfExperience = doctorProfile.YearsOfExperience,
                Biography = doctorProfile.Biography,
                Avatar = doctorProfile.Avatar
            };
        }

        public async Task<DoctorProfileResponseDTO> Update(string id, UpdateDoctorProfileDTO request)
        {
            var doctorProfile = await _doctorProfileRepository.FindByIdAsync(id);
            if (doctorProfile == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy hồ sơ bác sĩ");
            }

            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == doctorProfile.DoctorId)
                .ToListAsync();
            if (userRoles == null || !userRoles.Any(ur => ur.RoleName == "DOCTOR"))
            {
                throw new UnauthorizedAccessException("Chỉ những người dùng có vai trò BÁC SĨ mới được cập nhật hồ sơ.");
            }
            var oldData = new
            {
                doctorProfile.Qualifications,
                doctorProfile.YearsOfExperience,
                doctorProfile.Biography,
                doctorProfile.Avatar
            };
            doctorProfile.Qualifications = request.Qualifications;
            doctorProfile.YearsOfExperience = request.YearsOfExperience;
            doctorProfile.Biography = request.Biography;
            doctorProfile.Avatar = request.Avatar;
            var sessionUser = await _authService.GetAuthenticatedUser();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _doctorProfileRepository.UpdateAsync(doctorProfile);
                await _context.SaveChangesAsync();
                await _auditLogRepository.LogAsync(
    userId: sessionUser.Id,
    action: "UPDATE",
    tableName: "DoctorProfiles",
    recordId: doctorProfile.Id,
    oldData: oldData,
    newData: doctorProfile
);
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new DoctorProfileResponseDTO
            {
                Id = doctorProfile.Id,
                DoctorId = doctorProfile.DoctorId,
                Qualifications = doctorProfile.Qualifications,
                YearsOfExperience = doctorProfile.YearsOfExperience,
                Biography = doctorProfile.Biography,
                Avatar = doctorProfile.Avatar
            };
        }

        public async Task Delete(string id)
        {
            var doctorProfile = await _doctorProfileRepository.FindByIdAsync(id);
            if (doctorProfile == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy hồ sơ bác sĩ\"");
            }
            var sessionUser = await _authService.GetAuthenticatedUser();
            await _doctorProfileRepository.DeleteAsync(doctorProfile);
            await _context.SaveChangesAsync();
            await _auditLogRepository.LogAsync(
    userId: sessionUser.Id,
    action: "DELETE",
    tableName: "DoctorProfiles",
    recordId: doctorProfile.Id,
    oldData: doctorProfile,
    newData: null
);
        }

        public async Task<DoctorProfileResponseDTO> UploadAvatar(string doctorProfileId, IFormFile avatar)
        {
            _logger.LogInformation("Bắt đầu upload avatar cho doctorProfileId = {DoctorProfileId}", doctorProfileId);

            var doctorProfile = await _doctorProfileRepository.FindByIdAsync(doctorProfileId)
                ?? throw new ResourceNotFoundException("Không tìm thấy hồ sơ bác sĩ");

            try
            {
                if (!string.IsNullOrEmpty(doctorProfile.Avatar))
                {
                    _logger.LogInformation("Xóa avatar cũ tại đường dẫn: {OldAvatarUrl}", doctorProfile.Avatar);
                    await _fileService.DeleteFileAsync(doctorProfile.Avatar);
                }

                var url = await _fileService.SaveFileAsync(avatar, "uploads/doctorProfile/");
                doctorProfile.Avatar = url;

                await _doctorProfileRepository.UpdateAsync(doctorProfile);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Upload avatar thành công cho doctorProfileId = {DoctorProfileId}. Đường dẫn mới: {NewAvatarUrl}", doctorProfileId, url);

                var backendUrl = _configuration["App:BackendUrl"]?.TrimEnd('/');

                return new DoctorProfileResponseDTO
                {
                    Id = doctorProfile.Id,
                    DoctorId = doctorProfile.DoctorId,
                    Qualifications = doctorProfile.Qualifications,
                    YearsOfExperience = doctorProfile.YearsOfExperience,
                    Biography = doctorProfile.Biography,
                    Avatar = $"{backendUrl}/{url.TrimStart('/')}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi upload avatar cho doctorProfileId = {DoctorProfileId}", doctorProfileId);
                throw;
            }
        }


    }
}