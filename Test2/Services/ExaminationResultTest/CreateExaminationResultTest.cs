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
    public class CreateExaminationResultTest
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
        public async Task CreateByVisitId_Success()
        {
            // Arrange
            var visitId = "v1";
            var patientId = "p1";
            var medRecordId = "m1";
            var doctorId = "d1";

            var visit = new Visit
            {
                Id = visitId,
                PatientProfileId = patientId,
                AppointmentId = "appt123",
                AssignedDoctorId = "doctor123",
                ExaminationRoomId = "room123",
                PatientName = "John Doe"
            };

            _context.PatientProfiles.Add(new PatientProfile
            {
                Id = patientId,
                CitizenId = "123456789",
                Email = "patient@example.com",
                Gender = "Male",
                Name = "John Doe",
                PhoneNumber = "0123456789",
                DateOfBirth = new DateTime(1990, 1, 1),
                Address = "123 Test Street"
            });

            _context.Visits.Add(visit);
            _context.MedicalRecords.Add(new MedicalRecord { Id = medRecordId, PatientProfileId = patientId });
            await _context.SaveChangesAsync();

            _repositoryMock.Setup(r => r.FindByVisitIdAsync(visitId)).ReturnsAsync((ExaminationResult?)null);
            _authServiceMock.Setup(a => a.GetAuthenticatedUser()).ReturnsAsync(new User { Id = doctorId });

            var request = new ExaminationResultRequestDTO
            {
                Summary = "summary",
                Conclusion = "conclusion"
            };

            // Act
            var result = await _service.CreateByVisitId(visitId, request);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(request.Summary, result.Summary);
            Assert.AreEqual(request.Conclusion, result.Conclusion);
        }

        [Test]
        public void CreateByVisitId_VisitNotFound_Throws()
        {
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() =>
                _service.CreateByVisitId("invalid-id", new ExaminationResultRequestDTO()));

            Assert.That(ex.Message, Is.EqualTo(MessageConstants.VISIT_NOT_FOUND));
        }

        [Test]
        public async Task CreateByVisitId_Conflict_Throws()
        {
            // Arrange
            var visitId = "v2";
            var patientId = "p2";

            var visit = new Visit
            {
                Id = visitId,
                PatientProfileId = patientId,
                AppointmentId = "appt123",
                AssignedDoctorId = "doctor123",
                ExaminationRoomId = "room123",
                PatientName = "John Doe"
            };

            _context.Visits.Add(visit);
            await _context.SaveChangesAsync();

            _repositoryMock.Setup(r => r.FindByVisitIdAsync(visitId))
                .ReturnsAsync(new ExaminationResult { Id = "existing" });

            // Act + Assert
            var ex = Assert.ThrowsAsync<ConflictDataException>(() =>
                _service.CreateByVisitId(visitId, new ExaminationResultRequestDTO()));

            Assert.That(ex.Message, Is.EqualTo(MessageConstants.EXAMINATION_RESULT_CONFLICT));
        }

        [Test]
        public async Task CreateByVisitId_PatientNotFound_Throws()
        {
            var visitId = "v3";
            var visit = new Visit
            {
                Id = visitId,
                PatientProfileId = "patientId",
                AppointmentId = "appt123",
                AssignedDoctorId = "doctor123",
                ExaminationRoomId = "room123",
                PatientName = "John Doe"
            };


            _context.Visits.Add(visit);
            await _context.SaveChangesAsync();

            _repositoryMock.Setup(r => r.FindByVisitIdAsync(visitId))
                .ReturnsAsync((ExaminationResult?)null);

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() =>
                _service.CreateByVisitId(visitId, new ExaminationResultRequestDTO()));

            Assert.That(ex.Message, Is.EqualTo(MessageConstants.PATIENT_PROTILE_NOT_FOUND));
        }
    }

}
