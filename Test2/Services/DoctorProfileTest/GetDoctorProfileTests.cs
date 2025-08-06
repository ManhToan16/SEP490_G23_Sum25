using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.DoctorProfileRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.DoctorProfileServices;
using SEP490_BE.Services.FileServices;
using SEP490_BE.Services.ServiceServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.DoctorProfileTest
{
    [TestFixture]
    public class GetDoctorProfileTests
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
        public async Task GetById_DoctorProfileExists_ReturnsDoctorProfileResponseDTO()
        {
            // Arrange
            var doctorId = "doctor123";
            var doctorProfile = new DoctorProfile
            {
                Id = "dp001",
                DoctorId = doctorId,
                Qualifications = "BS CKI",
                YearsOfExperience = 10,
                Biography = "Chuyên nội thần kinh",
                Avatar = "avatar.jpg",
                Doctor = new User
                {
                    Id = doctorId,
                    Name = "Nguyễn Văn A",
                    PhoneNumber = "0901234567",
                    Email = "vana@example.com",
                    DateOfBirth = new DateTime(1985, 1, 1)
                }
            };

            _doctorProfileRepoMock.Setup(repo => repo.FindByDoctorIdAsync(doctorId))
                .ReturnsAsync(doctorProfile);

            // Act
            var result = await _service.GetById(doctorId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(doctorProfile.Id, result.Id);
            Assert.AreEqual(doctorProfile.DoctorId, result.DoctorId);
            Assert.AreEqual(doctorProfile.Qualifications, result.Qualifications);
            Assert.AreEqual(doctorProfile.YearsOfExperience, result.YearsOfExperience);
            Assert.AreEqual(doctorProfile.Biography, result.Biography);
            Assert.AreEqual(doctorProfile.Avatar, result.Avatar);
            Assert.AreEqual(doctorProfile.Doctor.Name, result.Name);
            Assert.AreEqual(doctorProfile.Doctor.PhoneNumber, result.PhoneNumber);
            Assert.AreEqual(doctorProfile.Doctor.Email, result.Email);
            Assert.AreEqual(doctorProfile.Doctor.DateOfBirth, result.DateOfBirth);
        }

        [Test]
        public void GetById_DoctorProfileNotFound_ThrowsResourceNotFoundException()
        {
            // Arrange
            var doctorId = "nonexistent";
            _doctorProfileRepoMock.Setup(repo => repo.FindByDoctorIdAsync(doctorId))
                .ReturnsAsync((DoctorProfile?)null);

            // Act + Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.GetById(doctorId));
            Assert.That(ex.Message, Is.EqualTo("Không tìm thấy hồ sơ bác sĩ"));
        }
    }
}
