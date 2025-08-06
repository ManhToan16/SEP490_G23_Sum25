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
    public class UpdateMedicalRecordTest
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
        public async Task UpdateMedicalRecord_Success()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            using var context = new KhanhAnNeurologyClinicContext(options);

            var existingRecord = new MedicalRecord
            {
                Id = "MR001",
                PatientProfileId = "P001",
                MedicalHistory = "Old History",
                Allergies = "None",
                SurgicalHistory = "Appendix",
                Treatment = "Paracetamol",
                CurrentMedications = "None",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            };

            context.MedicalRecords.Add(existingRecord);
            await context.SaveChangesAsync();

            var updateRequest = new MedicalRecordRequestDTO
            {
                MedicalHistory = "New History",
                Allergies = "Peanuts",
                SurgicalHistory = "None",
                Treatment = "Ibuprofen",
                CurrentMedications = "Vitamin C"
            };

            var user = new User { Id = "U001", Name = "TestUser" };

            var repositoryMock = new Mock<IMedicalRecordRepository>();
            repositoryMock.Setup(r => r.FindByIdAsync(existingRecord.Id)).ReturnsAsync(existingRecord);
            repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<MedicalRecord>())).Returns(Task.CompletedTask);

            var authServiceMock = new Mock<IAuthService>();
            authServiceMock.Setup(a => a.GetAuthenticatedUser()).ReturnsAsync(user);

            var logRepoMock = new Mock<IAuditLogRepository>();
            logRepoMock.Setup(l => l.LogAsync(user.Id, "UPDATE", "MedicalRecords", existingRecord.Id, It.IsAny<object>(), It.IsAny<object>()))
                       .Returns(Task.CompletedTask);

            var service = new MedicalRecordService(
                repositoryMock.Object,
                context,
                Mock.Of<IFileService>(),
                Mock.Of<IConfiguration>(),
                authServiceMock.Object,
                logRepoMock.Object
            );

            // Act
            var result = await service.Update(existingRecord.Id, updateRequest);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(updateRequest.MedicalHistory, result.MedicalHistory);
            Assert.AreEqual(updateRequest.Allergies, result.Allergies);
            Assert.AreEqual(updateRequest.Treatment, result.Treatment);
            repositoryMock.Verify(r => r.UpdateAsync(It.IsAny<MedicalRecord>()), Times.Once);
            logRepoMock.Verify(l => l.LogAsync(user.Id, "UPDATE", "MedicalRecords", existingRecord.Id, It.IsAny<object>(), It.IsAny<object>()), Times.Once);
        }

    }
}