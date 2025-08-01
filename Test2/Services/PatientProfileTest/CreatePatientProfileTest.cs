using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using SEP490_BE.DTO.PatientProfileDTO;
using SEP490_BE.DTO.UserDTO;
using SEP490_BE.Entities;
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
using SEP490_BE.Constants;
using SEP490_BE.Exceptions;

namespace Test2.Services.PatientProfileTest
{
    [TestFixture]
    public class CreatePatientProfileTest
    {
        private Mock<IPatientProfileRepository> _patientRepoMock = null!;
        private Mock<IMedicalRecordRepository> _medicalRecordRepoMock = null!;
        private Mock<IAuditLogRepository> _auditLogRepoMock = null!;
        private Mock<IAuthService> _authServiceMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DatabaseFacade> _databaseMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;
        private PatientProfileService _service = null!;

        [SetUp]
        public void Setup()
        {
            _patientRepoMock = new Mock<IPatientProfileRepository>();
            _medicalRecordRepoMock = new Mock<IMedicalRecordRepository>();
            _auditLogRepoMock = new Mock<IAuditLogRepository>();
            _authServiceMock = new Mock<IAuthService>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>(new DbContextOptions<KhanhAnNeurologyClinicContext>());

            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();

            _databaseMock.Setup(db => db.BeginTransactionAsync(It.IsAny<CancellationToken>()))
                         .ReturnsAsync(_transactionMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _service = new PatientProfileService(
                _contextMock.Object,
                _patientRepoMock.Object,
                _medicalRecordRepoMock.Object,
                _authServiceMock.Object,
                _auditLogRepoMock.Object
            );
        }

        [Test]
        public async Task Create_ShouldCreateSuccessfully_WhenValid()
        {
            // Arrange
            var request = new PatientProfileRequestDTO
            {
                Name = "Nguyễn Văn A",
                CitizenId = "123456789012",
                PhoneNumber = "0123456789",
                Email = "a@example.com",
                Gender = "Male",
                DateOfBirth = new DateTime(1990, 1, 1),
                Address = "123 Đường ABC"
            };

            _authServiceMock.Setup(x => x.GetAuthenticatedUser())
                .ReturnsAsync(new User { Id = "user-1" });

            _auditLogRepoMock.Setup(x => x.LogAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
                It.IsAny<string>(), It.IsAny<object>(), It.IsAny<object>())
            ).Returns(Task.CompletedTask);

            // Act
            var result = await _service.Create(request);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(request.CitizenId, result.CitizenId);
            Assert.AreEqual(request.Name, result.Name);
        }


        [Test]
        public async Task Create_ShouldAddPatientAndMedicalRecord_WhenCitizenIdDoesNotExist()
        {
            // Arrange
            var request = new PatientProfileRequestDTO
            {
                Name = "Nguyễn Văn A",
                CitizenId = "123456789",
                PhoneNumber = "0123456789",
                Email = "a@gmail.com",
                DateOfBirth = new DateTime(2000, 1, 1),
                Gender = "Nam",
                Address = "Hà Nội"
            };

            _patientRepoMock.Setup(r => r.FindByCitizenId(request.CitizenId)).ReturnsAsync((PatientProfile?)null);
            _authServiceMock.Setup(s => s.GetAuthenticatedUser()).ReturnsAsync(new User { Id = "user-1" });
            _patientRepoMock.Setup(r => r.Add(It.IsAny<PatientProfile>())).Returns(Task.CompletedTask);
            _medicalRecordRepoMock.Setup(r => r.InsertAsync(It.IsAny<MedicalRecord>())).Returns(Task.CompletedTask);
            _auditLogRepoMock.Setup(r => r.LogAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), null, It.IsAny<object>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            // Act
            var result = await _service.Create(request);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(request.CitizenId, result.CitizenId);
            Assert.AreEqual(request.Email, result.Email);

            _patientRepoMock.Verify(r => r.Add(It.IsAny<PatientProfile>()), Times.Once);
            _medicalRecordRepoMock.Verify(r => r.InsertAsync(It.IsAny<MedicalRecord>()), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public void Create_ShouldThrowConflictDataException_WhenCitizenIdAlreadyExists()
        {
            // Arrange
            var request = new PatientProfileRequestDTO
            {
                Name = "Trần Thị B",
                CitizenId = "999888777",
                PhoneNumber = "0999999999",
                Email = "b@gmail.com",
                DateOfBirth = new DateTime(1995, 12, 25),
                Gender = "Nữ",
                Address = "Hồ Chí Minh"
            };

            _patientRepoMock.Setup(r => r.FindByCitizenId(request.CitizenId)).ReturnsAsync(new PatientProfile());

            // Act & Assert
            var ex = Assert.ThrowsAsync<ConflictDataException>(() => _service.Create(request));
            Assert.That(ex!.Message, Is.EqualTo(MessageConstants.PATIENT_PROTILE_EXISTS));
            _patientRepoMock.Verify(r => r.Add(It.IsAny<PatientProfile>()), Times.Never);
        }
    }

}
