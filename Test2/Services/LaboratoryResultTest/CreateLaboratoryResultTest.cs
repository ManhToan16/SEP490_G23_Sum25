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
    public class CreateLaboratoryResultTest
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
        public async Task CreateByAssignmentId_Success()
        {
            // Arrange
            var assignmentId = "asg1";
            var visitId = "visit1";
            var examinationResultId = "er1";
            var technicianId = "tech1";

            var technician = new User
            {
                Id = technicianId,
                Name = "Technician A",
                Email = "tech@example.com",
                Gender = "Male",
                Password = "hashed-password",
                PhoneNumber = "0123456789"
            };


            var examinationResult = new ExaminationResult
            {
                Id = examinationResultId,
                VisitId = visitId,
                DoctorId = "doc1",
                MedicalRecordId = "mr1",
                Summary = "Summary",
                Conclusion = "Conclusion",
                CreatedAt = DateTime.UtcNow
            };

            var visit = new Visit
            {
                Id = visitId,
                AppointmentId = "appt123",
                AssignedDoctorId = "doc456",
                ExaminationRoomId = "room789",
                PatientProfileId = "patient1",
                PatientName = "Nguyen Van A",
                ExaminationResults = new List<ExaminationResult> { examinationResult } // dùng lại instance đã khai báo
            };

            // Gán quan hệ ngược nếu cần
            examinationResult.Visit = visit;


            var assignment = new Assignment
            {
                Id = assignmentId,
                Status = AssignmentStatus.PENDING,
                LaboratoryRoomId = "lab-room-1",
                VisitId = visitId
            };

            // Add to context
            await _context.Users.AddAsync(technician);
            await _context.ExaminationResults.AddAsync(examinationResult);
            await _context.Visits.AddAsync(visit);
            await _context.Assignments.AddAsync(assignment);
            await _context.SaveChangesAsync();

            // Mock authService trả về technician
            _authServiceMock.Setup(a => a.GetAuthenticatedUser()).ReturnsAsync(technician);

            // Mock _logRepository.LogAsync
            _logRepoMock.Setup(l => l.LogAsync(It.IsAny<string>(), "CREATE", "LaboratoryResults", It.IsAny<string>(), null, It.IsAny<object>()))
                .Returns(Task.CompletedTask);

            // Act
            var response = await _service.CreateByAssignmentId(assignmentId);

            // Assert
            Assert.NotNull(response);
            Assert.AreEqual(assignmentId, response.AssignmentId);
            Assert.AreEqual(technicianId, response.TechnicianId);

            var resultInDb = await _context.LaboratoryResults.FindAsync(response.Id);
            Assert.NotNull(resultInDb);
            Assert.AreEqual(response.Id, resultInDb.Id);
        }

       
    }
}
