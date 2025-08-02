using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.Constants;
using SEP490_BE.DTO.PatientProfileDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.MedicalRecordRepositories;
using SEP490_BE.Repositories.PatientProfileRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.PatientProfileServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.PatientProfileTest
{
    [TestFixture]
    public class UpdatePatientProfileTest
    {
        private Mock<IPatientProfileRepository> _patientRepoMock = null!;
        private Mock<IMedicalRecordRepository> _medicalRecordRepoMock = null!;
        private Mock<IAuthService> _authServiceMock = null!;
        private Mock<IAuditLogRepository> _auditLogRepoMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _dbContextMock = null!;
        private PatientProfileService _service = null!;

        [SetUp]
        public void Setup()
        {
            _patientRepoMock = new Mock<IPatientProfileRepository>();
            _medicalRecordRepoMock = new Mock<IMedicalRecordRepository>();
            _authServiceMock = new Mock<IAuthService>();
            _auditLogRepoMock = new Mock<IAuditLogRepository>();
            _dbContextMock = new Mock<KhanhAnNeurologyClinicContext>(new DbContextOptions<KhanhAnNeurologyClinicContext>());

            var mockTransaction = new Mock<IDbContextTransaction>();
            var dbFacadeMock = new Mock<DatabaseFacade>(_dbContextMock.Object);
            dbFacadeMock.Setup(db => db.BeginTransactionAsync(default)).ReturnsAsync(mockTransaction.Object);
            _dbContextMock.Setup(c => c.Database).Returns(dbFacadeMock.Object);

            _service = new PatientProfileService(
                _dbContextMock.Object,
                _patientRepoMock.Object,
                _medicalRecordRepoMock.Object,
                _authServiceMock.Object,
                _auditLogRepoMock.Object
            );
        }

        [Test]
        public async Task Update_ShouldSucceed_WhenValid()
        {
            // Arrange
            var existing = new PatientProfile
            {
                Id = "abc123",
                Name = "Old Name",
                CitizenId = "111",
                PhoneNumber = "123456789",
                Email = "old@gmail.com",
                DateOfBirth = new DateTime(1990, 1, 1),
                Gender = "Nam",
                Address = "Old Address"
            };

            var request = new PatientProfileRequestDTO
            {
                Name = "New Name",
                CitizenId = "111",
                PhoneNumber = "987654321",
                Email = "new@gmail.com",
                DateOfBirth = new DateTime(1991, 2, 2),
                Gender = "Nữ",
                Address = "New Address"
            };

            _patientRepoMock.Setup(r => r.FindById("abc123")).ReturnsAsync(existing);
            _patientRepoMock.Setup(r => r.FindByCitizenId("111")).ReturnsAsync(existing);
            _authServiceMock.Setup(a => a.GetAuthenticatedUser()).ReturnsAsync(new User { Id = "user123" });

            // Act
            var result = await _service.Update("abc123", request);

            // Assert
            Assert.AreEqual("New Name", result.Name);
            Assert.AreEqual("987654321", result.PhoneNumber);
            Assert.AreEqual("new@gmail.com", result.Email);
            _patientRepoMock.Verify(r => r.Update(It.IsAny<PatientProfile>()), Times.Once);
            _auditLogRepoMock.Verify(a => a.LogAsync("user123", "UPDATE", "PatientProfiles", "abc123", It.IsAny<object>(), It.IsAny<object>()), Times.Once);
        }

        [Test]
        public void Update_ShouldThrow_WhenPatientNotFound()
        {
            _patientRepoMock.Setup(r => r.FindById("missing")).ReturnsAsync((PatientProfile?)null);

            var request = new PatientProfileRequestDTO
            {
                Name = "Test",
                CitizenId = "000",
                PhoneNumber = "000",
                Email = "x@x.com",
                DateOfBirth = DateTime.Now,
                Gender = "Khác",
                Address = "Test"
            };

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Update("missing", request));
            Assert.That(ex!.Message, Is.EqualTo(MessageConstants.PATIENT_PROTILE_NOT_FOUND));
        }

        [Test]
        public void Update_ShouldThrow_WhenCitizenIdBelongsToAnotherPatient()
        {
            var current = new PatientProfile
            {
                Id = "abc123",
                CitizenId = "111"
            };

            var other = new PatientProfile
            {
                Id = "def456",
                CitizenId = "222"
            };

            var request = new PatientProfileRequestDTO
            {
                Name = "Test",
                CitizenId = "222",
                PhoneNumber = "000",
                Email = "x@x.com",
                DateOfBirth = DateTime.Now,
                Gender = "Khác",
                Address = "Test"
            };

            _patientRepoMock.Setup(r => r.FindById("abc123")).ReturnsAsync(current);
            _patientRepoMock.Setup(r => r.FindByCitizenId("222")).ReturnsAsync(other);

            var ex = Assert.ThrowsAsync<ConflictDataException>(() => _service.Update("abc123", request));
            Assert.That(ex!.Message, Is.EqualTo(MessageConstants.PATIENT_PROTILE_EXISTS));
        }
    }

}
