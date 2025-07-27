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

namespace Test.Services.DoctorProfileTest
{
    [TestFixture]
    public class GetDoctorProfileTests
    {
        private Mock<IDoctorProfileRepository> _mockDoctorProfileRepository;
        private DoctorProfileService _doctorProfileService;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DbSet<DoctorProfile>> _doctorProfileMock = null!;
        private Mock<DatabaseFacade> _databaseMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;

        [SetUp]
        public void Setup()
        {
            Console.WriteLine("Setup called");
            _mockDoctorProfileRepository = new Mock<IDoctorProfileRepository>();

            _doctorProfileService = new DoctorProfileService(
                null, // DbContext (not needed in GetById)
                _mockDoctorProfileRepository.Object,
                Mock.Of<IFileService>(),
                Mock.Of<IConfiguration>(),
                Mock.Of<IAuditLogRepository>(),
                Mock.Of<IAuthService>(),
                Mock.Of<ILogger<DoctorProfileService>>()
            );
            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();
            _databaseMock.Setup(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            _contextMock.Setup(c => c.DoctorProfiles).Returns(_doctorProfileMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        }

        [Test]
        public async Task GetById_ValidId_ReturnsCorrectDTO()
        {
            // Arrange
            var doctorId = "doctor-id-001";
            var doctorProfile = new DoctorProfile
            {
                Id = "profile-id-001",
                DoctorId = doctorId,
                Qualifications = "Chuyên khoa thần kinh",
                YearsOfExperience = 10,
                Biography = "Tiểu sử chi tiết",
                Avatar = "avatar.jpg",
                Doctor = new User
                {
                    Name = "Nguyễn Văn A",
                    PhoneNumber = "0909123456",
                    Email = "a@example.com",
                    DateOfBirth = new DateTime(1985, 5, 10)
                }
            };

            _mockDoctorProfileRepository.Setup(r => r.FindByDoctorIdAsync(doctorId))
                .ReturnsAsync(doctorProfile);

            // Act
            var result = await _doctorProfileService.GetById(doctorId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Id, Is.EqualTo(doctorProfile.Id));
            Assert.That(result.DoctorId, Is.EqualTo(doctorProfile.DoctorId));
            Assert.That(result.Qualifications, Is.EqualTo(doctorProfile.Qualifications));
            Assert.That(result.YearsOfExperience, Is.EqualTo(doctorProfile.YearsOfExperience));
            Assert.That(result.Biography, Is.EqualTo(doctorProfile.Biography));
            Assert.That(result.Avatar, Is.EqualTo(doctorProfile.Avatar));
            Assert.That(result.Name, Is.EqualTo(doctorProfile.Doctor.Name));
            Assert.That(result.PhoneNumber, Is.EqualTo(doctorProfile.Doctor.PhoneNumber));
            Assert.That(result.Email, Is.EqualTo(doctorProfile.Doctor.Email));
            Assert.That(result.DateOfBirth, Is.EqualTo(doctorProfile.Doctor.DateOfBirth));
        }

        [Test]
        public void GetById_DoctorProfileNotFound_ThrowsResourceNotFoundException()
        {
            // Arrange
            var doctorId = "not-found-id";

            _mockDoctorProfileRepository.Setup(r => r.FindByDoctorIdAsync(doctorId))
                .ReturnsAsync((DoctorProfile)null!);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _doctorProfileService.GetById(doctorId));
            Assert.That(ex!.Message, Is.EqualTo("Không tìm thấy hồ sơ bác sĩ"));
        }
    }
}
