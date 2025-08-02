using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using SEP490_BE.Constants;
using SEP490_BE.DTO.ExaminationResultDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.ExaminationResultRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.ExaminationResultServices;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Test2.Services.ExaminationResultTest
{

    [TestFixture]
    public class UpdateExaminationResultTest
    {
        private KhanhAnNeurologyClinicContext _context = null!;
        private Mock<IExaminationResultRepository> _repositoryMock = null!;
        private Mock<IAuthService> _authServiceMock = null!;
        private Mock<IAuditLogRepository> _logRepoMock = null!;
        private ExaminationResultService _service = null!;

        [SetUp]
        public void SetUp()
        {
            var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
             .UseInMemoryDatabase(Guid.NewGuid().ToString())
             .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning)) // <- suppress warning
             .Options;


            _context = new KhanhAnNeurologyClinicContext(options);
            _repositoryMock = new Mock<IExaminationResultRepository>();
            _authServiceMock = new Mock<IAuthService>();
            _logRepoMock = new Mock<IAuditLogRepository>();

            _service = new ExaminationResultService(
                _repositoryMock.Object,
                _context,
                _authServiceMock.Object,
                _logRepoMock.Object
            );
        }

        [Test]
        public async Task Update_Success()
        {
            // Arrange
            var examResultId = "er1";
            var visitId = "v1";
            var patientId = "p1";
            var doctorId = "d1";

            var visit = new Visit
            {
                Id = visitId,
                PatientProfileId = patientId,
                AppointmentId = "appt1",
                AssignedDoctorId = doctorId,
                Status = VisitStatus.IN_EXAMINATION,
                PatientName = "Test Patient",
                ExaminationRoomId = "room1"
            };

            var examResult = new ExaminationResult
            {
                Id = examResultId,
                VisitId = visitId,
                MedicalRecordId = "mr1",
                DoctorId = doctorId,
                Summary = "old summary",
                Conclusion = "old conclusion",
                AccessCode = "abc123",
                CreatedAt = DateTime.UtcNow
            };

            // Ghi nhớ: phải thêm Visit vào context vì service gọi FindAsync(visitId)
            _context.Visits.Add(visit);
            await _context.SaveChangesAsync();

            _repositoryMock.Setup(r => r.FindByIdAsync(examResultId)).ReturnsAsync(examResult);
            _repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<ExaminationResult>())).Returns(Task.CompletedTask);
            _authServiceMock.Setup(a => a.GetAuthenticatedUser()).ReturnsAsync(new User { Id = doctorId });
            _logRepoMock.Setup(log => log.LogAsync(It.IsAny<string>(), "UPDATE", "ExaminationResults",
                It.IsAny<string>(), It.IsAny<object>(), It.IsAny<object>())).Returns(Task.CompletedTask);

            var request = new ExaminationResultRequestDTO
            {
                Summary = "updated summary",
                Conclusion = "updated conclusion"
            };

            // Act
            var result = await _service.Update(examResultId, request);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(request.Summary, result.Summary);
            Assert.AreEqual(request.Conclusion, result.Conclusion);
        }

    }

}
