using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Moq;
using SEP490_BE.DTO.MedicalRecordDTO;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.MedicalRecordRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.FileServices;
using SEP490_BE.Services.MedicalRecordServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.MedicalRecordTest
{
    [TestFixture]
    public class CreateMedicalRecordTest
    {
        private MedicalRecordService _service;
        private Mock<IMedicalRecordRepository> _repositoryMock;
        private Mock<IFileService> _fileServiceMock;
        private Mock<IConfiguration> _configurationMock;
        private Mock<IAuthService> _authServiceMock;
        private Mock<IAuditLogRepository> _logRepositoryMock;
        private KhanhAnNeurologyClinicContext _context;

        [SetUp]
        public void SetUp()
        {
            var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _context = new KhanhAnNeurologyClinicContext(options);

            _repositoryMock = new Mock<IMedicalRecordRepository>();
            _fileServiceMock = new Mock<IFileService>();
            _configurationMock = new Mock<IConfiguration>();
            _authServiceMock = new Mock<IAuthService>();
            _logRepositoryMock = new Mock<IAuditLogRepository>();

            _service = new MedicalRecordService(
                _repositoryMock.Object,
                _context,
                _fileServiceMock.Object,
                _configurationMock.Object,
                _authServiceMock.Object,
                _logRepositoryMock.Object
            );
        }

        [Test]
        public async Task CreateMedicalRecord_Success()
        {
            // Arrange
            var patientProfileId = "patient-123";
            var request = new MedicalRecordRequestDTO
            {
                MedicalHistory = "Tiền sử đau đầu",
                Allergies = "Không",
                SurgicalHistory = "Phẫu thuật ruột thừa",
                Treatment = "Uống thuốc giảm đau",
                CurrentMedications = "Paracetamol"
            };

            var sessionUser = new User { Id = "user-1", Name = "Admin" };

            _repositoryMock.Setup(r => r.FindByPatientProfileIdAsync(patientProfileId))
                .ReturnsAsync((MedicalRecord?)null);

            _repositoryMock.Setup(r => r.InsertAsync(It.IsAny<MedicalRecord>()))
                .Returns(Task.CompletedTask);

            _authServiceMock.Setup(a => a.GetAuthenticatedUser())
                .ReturnsAsync(sessionUser);

            _logRepositoryMock.Setup(log =>
                log.LogAsync(sessionUser.Id, "CREATE", "MedicalRecords", It.IsAny<string>(), null, It.IsAny<object>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.Create(patientProfileId, request);

            // Assert
            Assert.NotNull(result);
            Assert.AreEqual(patientProfileId, result.PatientProfileId);
            Assert.AreEqual(request.MedicalHistory, result.MedicalHistory);
            Assert.AreEqual(request.Allergies, result.Allergies);
            Assert.AreEqual(request.SurgicalHistory, result.SurgicalHistory);
            Assert.AreEqual(request.Treatment, result.Treatment);
            Assert.AreEqual(request.CurrentMedications, result.CurrentMedications);

            _repositoryMock.Verify(r => r.InsertAsync(It.IsAny<MedicalRecord>()), Times.Once);
            _logRepositoryMock.Verify(l => l.LogAsync(
                sessionUser.Id, "CREATE", "MedicalRecords", It.IsAny<string>(), null, It.IsAny<object>()), Times.Once);
        }
    }

}
