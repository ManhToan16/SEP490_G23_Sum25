using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Moq;
using SEP490_BE.Constants;
using SEP490_BE.DTO.LaboratoryResultDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AssignmentRepositories;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.LaboratoryResultRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.FileServices;
using SEP490_BE.Services.LaboratoryResultServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ArgumentException = SEP490_BE.Exceptions.ArgumentException;

namespace Test2.Services.LaboratoryResultTest
{
    [TestFixture]
    public class UpdateLaboratoryResultTest
    {
        private Mock<ILaboratoryResultRepository> _resultRepoMock;
        private Mock<ILaboratoryFileRepository> _fileRepoMock;
        private Mock<IAssignmentRepository> _assignmentRepoMock;
        private Mock<IFileService> _fileServiceMock;
        private Mock<IAuthService> _authServiceMock;
        private Mock<IAuditLogRepository> _logRepoMock;
        private KhanhAnNeurologyClinicContext _context;
        private LaboratoryResultService _service;

        [SetUp]
        public void SetUp()
        {
            var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _context = new KhanhAnNeurologyClinicContext(options);

            _resultRepoMock = new Mock<ILaboratoryResultRepository>();
            _fileRepoMock = new Mock<ILaboratoryFileRepository>();
            _assignmentRepoMock = new Mock<IAssignmentRepository>();
            _fileServiceMock = new Mock<IFileService>();
            _authServiceMock = new Mock<IAuthService>();
            _logRepoMock = new Mock<IAuditLogRepository>();

            _service = new LaboratoryResultService(
                _resultRepoMock.Object,
                _fileRepoMock.Object,
                _assignmentRepoMock.Object,
                _fileServiceMock.Object,
                _authServiceMock.Object,
                _context,
                new ConfigurationBuilder().Build(),
                _logRepoMock.Object
            );
        }

        
        [Test]
        public void UpdateById_ShouldThrow_WhenResultNotFound()
        {
            // Arrange
            var resultId = "not-found";
            _resultRepoMock.Setup(r => r.GetByIdAsync(resultId)).ReturnsAsync((LaboratoryResult?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.UpdateById(resultId, new()));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.LABORATORY_RESULT_NOT_FOUND));
        }


    }
}
