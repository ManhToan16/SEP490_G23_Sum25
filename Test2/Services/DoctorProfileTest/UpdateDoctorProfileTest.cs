using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.DoctorProfileRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.DoctorProfileServices;
using SEP490_BE.Services.FileServices;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.DoctorProfileTest
{
    [TestFixture]
    public class UpdateDoctorProfileTest
    {
        
            private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
            private Mock<IDoctorProfileRepository> _doctorProfileRepoMock = null!;
            private Mock<IFileService> _fileServiceMock = null!;
            private Mock<IConfiguration> _configurationMock = null!;
            private Mock<IAuditLogRepository> _auditLogRepoMock = null!;
            private Mock<IAuthService> _authServiceMock = null!;
            private Mock<ILogger<DoctorProfileService>> _loggerMock = null!;

            private Mock<DatabaseFacade> _databaseMock = null!;
            private Mock<IDbContextTransaction> _transactionMock = null!;

            private DoctorProfileService _service = null!;

            [SetUp]
            public void SetUp()
            {
                _contextMock = new Mock<KhanhAnNeurologyClinicContext>();
                _doctorProfileRepoMock = new Mock<IDoctorProfileRepository>();
                _fileServiceMock = new Mock<IFileService>();
                _configurationMock = new Mock<IConfiguration>();
                _auditLogRepoMock = new Mock<IAuditLogRepository>();
                _authServiceMock = new Mock<IAuthService>();
                _loggerMock = new Mock<ILogger<DoctorProfileService>>();

                _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
                _transactionMock = new Mock<IDbContextTransaction>();

                _databaseMock.Setup(db => db.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
                _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
                _transactionMock.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

                _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
                _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

                _service = new DoctorProfileService(
                    _contextMock.Object,
                    _doctorProfileRepoMock.Object,
                    _fileServiceMock.Object,
                    _configurationMock.Object,
                    _auditLogRepoMock.Object,
                    _authServiceMock.Object,
                    _loggerMock.Object
                );
            }
            [Test]
        public async Task UpdateDoctorProfile_ValidRequest_ReturnsUpdatedDTO()
        {
            // Arrange
            var id = "profile-001";
            var profile = new DoctorProfile
            {
                Id = id,
                DoctorId = "doctor-001",
                Qualifications = "MD",
                YearsOfExperience = 5,
                Biography = "Cũ",
                Avatar = "old.jpg"
            };

            var dto = new UpdateDoctorProfileDTO
            {
                Qualifications = "PhD",
                YearsOfExperience = 10,
                Biography = "Mới",
                Avatar = "new.jpg"
            };

            _doctorProfileRepoMock.Setup(r => r.FindByIdAsync(id)).ReturnsAsync(profile);
            _contextMock.Setup(c => c.UserRoles)
                .Returns(DbSetMockHelper.CreateMockDbSet(new List<UserRole>
                {
                new UserRole { UserId = "doctor-001", RoleName = "DOCTOR" }
                }).Object);
            _authServiceMock.Setup(a => a.GetAuthenticatedUser())
                .ReturnsAsync(new User { Id = "admin-user" });

            var transactionMock = new Mock<IDbContextTransaction>();
            _contextMock.Setup(c => c.Database.BeginTransactionAsync(default)).ReturnsAsync(transactionMock.Object);

            // Act
            var result = await _service.Update(id, dto);

            // Assert
            Assert.That(result.Qualifications, Is.EqualTo(dto.Qualifications));
            Assert.That(result.YearsOfExperience, Is.EqualTo(dto.YearsOfExperience));
            Assert.That(result.Biography, Is.EqualTo(dto.Biography));
            Assert.That(result.Avatar, Is.EqualTo(dto.Avatar));
        }

        [Test]
        public void UpdateDoctorProfile_ProfileNotFound_ThrowsNotFound()
        {
            // Arrange
            var id = "profile-not-exist";
            _doctorProfileRepoMock.Setup(r => r.FindByIdAsync(id)).ReturnsAsync((DoctorProfile?)null);

            var dto = new UpdateDoctorProfileDTO
            {
                Qualifications = "Test",
                YearsOfExperience = 1,
                Biography = "Test",
                Avatar = "test.jpg"
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Update(id, dto));
            Assert.That(ex.Message, Is.EqualTo("Không tìm thấy hồ sơ bác sĩ"));
        }

        [Test]
        public void UpdateDoctorProfile_DoctorRoleMissing_ThrowsUnauthorized()
        {
            // Arrange
            var id = "profile-001";
            var profile = new DoctorProfile
            {
                Id = id,
                DoctorId = "doctor-001",
                Qualifications = "MD"
            };

            _doctorProfileRepoMock.Setup(r => r.FindByIdAsync(id)).ReturnsAsync(profile);
            _contextMock.Setup(c => c.UserRoles)
                .Returns(DbSetMockHelper.CreateMockDbSet(new List<UserRole>()).Object); // No roles

            var dto = new UpdateDoctorProfileDTO
            {
                Qualifications = "PhD",
                YearsOfExperience = 5,
                Biography = "Mới",
                Avatar = "new.jpg"
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.Update(id, dto));
            Assert.That(ex.Message, Is.EqualTo("Chỉ những người dùng có vai trò BÁC SĨ mới được cập nhật hồ sơ."));
        }
        private bool ValidateModel(object model, out List<ValidationResult> results)
        {
            var context = new ValidationContext(model, null, null);
            results = new List<ValidationResult>();
            return Validator.TryValidateObject(model, context, results, true);
        }

        [Test]
        public void UpdateDoctorProfileDTO_AllFieldsValid_PassesValidation()
        {
            var dto = new UpdateDoctorProfileDTO
            {
                Qualifications = "Bác sĩ chuyên khoa II",
                Biography = "Đã có hơn 15 năm kinh nghiệm trong lĩnh vực nội thần kinh.",
                YearsOfExperience = 15,
                Avatar = "avatar.jpg"
            };

            var isValid = ValidateModel(dto, out var results);

            Assert.IsTrue(isValid);
            Assert.IsEmpty(results);
        }

      
        [Test]
        public void UpdateDoctorProfileDTO_YearsOfExperienceNegative_FailsValidation()
        {
            var dto = new UpdateDoctorProfileDTO
            {
                Qualifications = "Bác sĩ",
                Biography = "Nhiều năm kinh nghiệm",
                YearsOfExperience = -2,
                Avatar = "avatar.png"
            };

            var isValid = ValidateModel(dto, out var results);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.ErrorMessage == "Số năm kinh nghiệm phải từ 0 đến 60."));
        }

      

        [Test]
        public void UpdateDoctorProfileDTO_YearsOfExperienceZero_PassesValidation()
        {
            var dto = new UpdateDoctorProfileDTO
            {
                Qualifications = "Thạc sĩ",
                Biography = "Mới tốt nghiệp",
                YearsOfExperience = 0,
                Avatar = null
            };

            var isValid = ValidateModel(dto, out var results);

            Assert.IsTrue(isValid);
            Assert.IsEmpty(results);
        }

    }

}
