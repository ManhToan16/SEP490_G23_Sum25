using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Moq;
using SEP490_BE.Constants;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.ExaminationResultRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.ExaminationResultServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.ExaminationResultTest
{

        [TestFixture]
        public class GetExaminationResultTest
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
        public async Task GetById_Success()
        {
            var visitId = "v1";
            var patientId = "p1";
            var doctorId = "d1";

            var doctor = new User
            {
                Id = doctorId,
                Name = "Dr. Who",
                Email = "doctor@example.com",
                Gender = "Male",
                Password = "hashed_password",
                PhoneNumber = "0987654321"
            };

            var visit = new Visit
            {
                Id = visitId,
                PatientProfileId = patientId,
                AppointmentId = "appt123",
                AssignedDoctorId = doctorId,
                ExaminationRoomId = "room123",
                PatientName = "John Doe"
            };

            var patient = new PatientProfile
            {
                Id = patientId,
                CitizenId = "123456789",
                Email = "patient@example.com",
                Gender = "Male",
                Name = "John Doe",
                PhoneNumber = "0123456789",
                DateOfBirth = new DateTime(1990, 1, 1),
                Address = "123 Test Street"
            };

            var result = new ExaminationResult
            {
                Id = "result1",
                VisitId = visitId,
                DoctorId = doctorId,
                MedicalRecordId = "mr1",
                Summary = "Summary",
                Conclusion = "Conclusion",
                AccessCode = "123ABC",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(doctor);
            await _context.PatientProfiles.AddAsync(patient);
            await _context.Visits.AddAsync(visit);
            await _context.ExaminationResults.AddAsync(result);
            await _context.SaveChangesAsync();

            // 👇 Setup repository để trả về đúng kết quả
            _repositoryMock.Setup(r => r.FindByIdAsync(result.Id)).ReturnsAsync(result);

            var response = await _service.GetById(result.Id);

            Assert.NotNull(response);
            Assert.AreEqual("John Doe", response.PatientName);
        }

    }
}
