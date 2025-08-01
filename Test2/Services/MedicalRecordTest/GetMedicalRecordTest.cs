using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Moq;
using SEP490_BE.Constants;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
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
    public class GetMedicalRecordTest
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
        public async Task GetById_Success()
        {
            // Arrange
            var record = new MedicalRecord { Id = "MR001", MedicalHistory = "History A" };
            var repoMock = new Mock<IMedicalRecordRepository>();
            repoMock.Setup(r => r.FindByIdAsync("MR001")).ReturnsAsync(record);

            var service = new MedicalRecordService(
                repoMock.Object,
                Mock.Of<KhanhAnNeurologyClinicContext>(),
                Mock.Of<IFileService>(),
                Mock.Of<IConfiguration>(),
                Mock.Of<IAuthService>(),
                Mock.Of<IAuditLogRepository>()
            );

            // Act
            var result = await service.GetById("MR001");

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("MR001", result.MedicalRecordId);
            Assert.AreEqual("History A", result.MedicalHistory);
        }

        [Test]
        public void GetById_NotFound_ThrowsException()
        {
            // Arrange
            var repoMock = new Mock<IMedicalRecordRepository>();
            repoMock.Setup(r => r.FindByIdAsync("MR999")).ReturnsAsync((MedicalRecord?)null);

            var service = new MedicalRecordService(
                repoMock.Object,
                Mock.Of<KhanhAnNeurologyClinicContext>(),
                Mock.Of<IFileService>(),
                Mock.Of<IConfiguration>(),
                Mock.Of<IAuthService>(),
                Mock.Of<IAuditLogRepository>()
            );

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => service.GetById("MR999"));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.MEDICAL_RECORD_NOT_FOUND));
        }


    }
}
