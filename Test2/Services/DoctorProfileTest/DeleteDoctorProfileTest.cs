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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.DoctorProfileTest
{
    [TestFixture]
    public class DeleteDoctorProfileTest
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
        public async Task Delete_ExistingDoctorProfile_DeletesSuccessfully()
        {
            // Arrange
            var doctorProfileId = "dp001";
            var mockProfile = new DoctorProfile
            {
                Id = doctorProfileId,
                DoctorId = "doctor123",
                Qualifications = "MD"
            };

            var mockUser = new User { Id = "admin001" };

            _doctorProfileRepoMock.Setup(repo => repo.FindByIdAsync(doctorProfileId))
                .ReturnsAsync(mockProfile);

            _authServiceMock.Setup(auth => auth.GetAuthenticatedUser())
                .ReturnsAsync(mockUser);

            _doctorProfileRepoMock.Setup(repo => repo.DeleteAsync(mockProfile))
                .Returns(Task.CompletedTask);

            _contextMock.Setup(ctx => ctx.SaveChangesAsync(default))
                .ReturnsAsync(1);

            _auditLogRepoMock.Setup(log => log.LogAsync(
                mockUser.Id, "DELETE", "DoctorProfiles", doctorProfileId, mockProfile, null))
                .Returns(Task.CompletedTask);

            // Act
            await _service.Delete(doctorProfileId);

            // Assert
            _doctorProfileRepoMock.Verify(repo => repo.DeleteAsync(mockProfile), Times.Once);
            _contextMock.Verify(ctx => ctx.SaveChangesAsync(default), Times.Once);
            _auditLogRepoMock.Verify(log => log.LogAsync(
                mockUser.Id, "DELETE", "DoctorProfiles", doctorProfileId, mockProfile, null), Times.Once);
        }

        [Test]
        public void Delete_DoctorProfileNotFound_ThrowsResourceNotFoundException()
        {
            // Arrange
            var nonexistentId = "notfound123";
            _doctorProfileRepoMock.Setup(repo => repo.FindByIdAsync(nonexistentId))
                .ReturnsAsync((DoctorProfile?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Delete(nonexistentId));
            Assert.That(ex.Message, Is.EqualTo("Không tìm thấy hồ sơ bác sĩ\""));
        }
    }
}
