using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Moq;
using SEP490_BE.Constants;
using SEP490_BE.DTO.AppointmentDTO;
using SEP490_BE.DTO.PatientProfileDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Hubs;
using SEP490_BE.Repositories.AppointmentRepositories;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.ExaminationResultRepositories;
using SEP490_BE.Repositories.MedicalRecordRepositories;
using SEP490_BE.Repositories.PatientProfileRepositories;
using SEP490_BE.Repositories.TimeSlotRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Repositories.VisitRepositories;
using SEP490_BE.Services.AppointmentServices;
using SEP490_BE.Services.AssignmentServices;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.EmailServices;
using SEP490_BE.Services.PatientProfileServices;
using SEP490_BE.Services.VisitServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.AppointmentTest
{

    [TestFixture]
    public class UpdateAppointmentTest
    {
        private Mock<IAppointmentRepository> _appointmentRepositoryMock;
        private Mock<IUserRepository> _userRepositoryMock;
        private Mock<IEmailService> _emailServiceMock;
        private Mock<IVisitRepository> _visitRepositoryMock;
        private Mock<IVisitService> _visitServiceMock;
        private Mock<IAssignmentService> _assignmentServiceMock;
        private Mock<ILogger<AppointmentService>> _loggerMock;
        private Mock<IHubContext<KhanhAnHub>> _hubContextMock;
        private Mock<IAuthService> _authServiceMock;
        private Mock<IAuditLogRepository> _logRepositoryMock;
        private Mock<ITimeSlotRepository> _timeSlotRepositoryMock;
        private Mock<IExaminationResultRepository> _examinationResultRepository;

        private KhanhAnNeurologyClinicContext _context;
        private AppointmentService _appointmentService;

        [SetUp]
        public void SetUp()
        {
            _appointmentRepositoryMock = new Mock<IAppointmentRepository>();
            _userRepositoryMock = new Mock<IUserRepository>();
            _emailServiceMock = new Mock<IEmailService>();
            _visitRepositoryMock = new Mock<IVisitRepository>();
            _visitServiceMock = new Mock<IVisitService>();
            _assignmentServiceMock = new Mock<IAssignmentService>();
            _loggerMock = new Mock<ILogger<AppointmentService>>();
            _hubContextMock = new Mock<IHubContext<KhanhAnHub>>();
            _authServiceMock = new Mock<IAuthService>();
            _logRepositoryMock = new Mock<IAuditLogRepository>();
            _examinationResultRepository = new Mock<IExaminationResultRepository>();

            _timeSlotRepositoryMock = new Mock<ITimeSlotRepository>();

            var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning)) // <- dòng này suppress lỗi
                .Options;
            _context = new KhanhAnNeurologyClinicContext(options);

            _context.TimeSlots.Add(new TimeSlot
            {
                Id = "slot-1",
                Name = "ca 1",
                StartTime = TimeSpan.FromHours(9),
                EndTime = TimeSpan.FromHours(10)
            });
            _context.SaveChanges();

            _appointmentService = new AppointmentService(
                _context,
                _authServiceMock.Object,
                _logRepositoryMock.Object,
                _appointmentRepositoryMock.Object,
                _userRepositoryMock.Object,
                _emailServiceMock.Object,
                _visitRepositoryMock.Object,
                _visitServiceMock.Object,
                _assignmentServiceMock.Object,
                _loggerMock.Object,
                _hubContextMock.Object,
                _timeSlotRepositoryMock.Object,
                _examinationResultRepository.Object
            );
        }

        [Test]
        public async Task Update_ShouldUpdateSuccessfully_WhenDataIsValid()
        {
            // Arrange
            var appointmentId = "appt-1";
            var doctorId = "doc-1";

            var timeSlot = new TimeSlot
            {
                Id = "slot-1",
                Name = "Morning Slot",
                StartTime = TimeSpan.FromHours(9),
                EndTime = TimeSpan.FromHours(10)
            };

            var doctor = new User { Id = doctorId, Name = "Dr. Strange" };

            var existingAppointment = new Appointment
            {
                Id = appointmentId,
                TimeSlotId = timeSlot.Id,
                Status = AppointmentStatus.WAITING_FOR_CONFIRMATION,
                TimeSlot = timeSlot,
                RequiredDoctor = doctor,
            };

            var request = new AppointmentRequestDTO
            {
                Name = "John Doe",
                PhoneNumber = "1234567890",
                Email = "john@example.com",
                DateOfBirth = new DateTime(1990, 1, 1),
                Gender = "Male",
                Address = "123 Street",
                Symptom = "Headache",
                RequiredDoctorId = doctorId,
                Date = DateTime.Today,
                TimeSlotId = "slot-1"
            };

            _appointmentRepositoryMock.Setup(r => r.FindById(appointmentId)).ReturnsAsync(existingAppointment);
            _userRepositoryMock.Setup(r => r.FindById(doctorId)).ReturnsAsync(doctor);
            _appointmentRepositoryMock.Setup(r => r.Update(It.IsAny<Appointment>())).Returns(Task.CompletedTask);

            var mockClients = new Mock<IHubClients>();
            var mockClientProxy = new Mock<IClientProxy>();
            mockClients.Setup(c => c.All).Returns(mockClientProxy.Object);
            _hubContextMock.Setup(h => h.Clients).Returns(mockClients.Object);

            // Act
            var result = await _appointmentService.Update(appointmentId, request);

            // Assert
            Assert.AreEqual(result.Name, request.Name);
            Assert.AreEqual(result.RequiredDoctorId, doctorId);
            Assert.AreEqual(result.TimeSlotId, "slot-1");
        }


        [Test]
        public void Update_ShouldThrow_WhenAppointmentNotFound()
        {
            // Arrange
            _appointmentRepositoryMock.Setup(r => r.FindById("notfound")).ReturnsAsync((Appointment)null);

            // Act + Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() =>
                _appointmentService.Update("notfound", new AppointmentRequestDTO()));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.APPOINTMENT_NOT_FOUND));
        }

        [Test]
        public void Update_ShouldThrow_WhenDoctorNotFound()
        {
            // Arrange
            var appointment = new Appointment
            {
                Id = "a1",
                TimeSlotId = "slot-1",
                Status = AppointmentStatus.WAITING_FOR_CONFIRMATION
            };

            _appointmentRepositoryMock.Setup(r => r.FindById("a1")).ReturnsAsync(appointment);
            _userRepositoryMock.Setup(r => r.FindById("missing-doctor")).ReturnsAsync((User)null);

            var request = new AppointmentRequestDTO
            {
                RequiredDoctorId = "missing-doctor",
                TimeSlotId = "slot-1"
            };

            // Act + Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() =>
                _appointmentService.Update("a1", request));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.DOCTOR_NOT_FOUND));
        }

        [Test]
        public void Update_ShouldThrow_WhenTimeSlotNotFound()
        {
            // Arrange
            var appointment = new Appointment
            {
                Id = "a1",
                Status = AppointmentStatus.WAITING_FOR_CONFIRMATION
            };

            _appointmentRepositoryMock.Setup(r => r.FindById("a1")).ReturnsAsync(appointment);
            _userRepositoryMock.Setup(r => r.FindById(It.IsAny<string>())).ReturnsAsync(new User());
            // Không tạo timeslot nên context không tìm thấy

            var request = new AppointmentRequestDTO
            {
                RequiredDoctorId = "doc-1",
                TimeSlotId = "missing-slot"
            };

            // Act + Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() =>
                _appointmentService.Update("a1", request));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.TIMESLOT_NOT_FOUND));
        }

        



    }
}