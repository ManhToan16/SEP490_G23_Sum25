using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Moq;
using SEP490_BE.Constants;
using SEP490_BE.DTO.AppointmentDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Hubs;
using SEP490_BE.Repositories.AppointmentRepositories;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.ExaminationResultRepositories;
using SEP490_BE.Repositories.TimeSlotRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Repositories.VisitRepositories;
using SEP490_BE.Services.AppointmentServices;
using SEP490_BE.Services.AssignmentServices;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.EmailServices;
using SEP490_BE.Services.VisitServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.AppointmentTest
{
    [TestFixture]
    public class GetAppointmentTest
    {
        private AppointmentService _service;
        private Mock<IAuthService> _authServiceMock;
        private Mock<IAppointmentRepository> _appointmentRepositoryMock;
        private Mock<IUserRepository> _userRepositoryMock;
        private Mock<IEmailService> _emailServiceMock;
        private Mock<IAuditLogRepository> _auditLogRepositoryMock;
        private Mock<IVisitRepository> _visitRepositoryMock;
        private Mock<IVisitService> _visitServiceMock;
        private Mock<IAssignmentService> _assignmentServiceMock;
        private Mock<IHubContext<KhanhAnHub>> _hubContextMock;
        private Mock<IClientProxy> _clientProxyMock;
        private Mock<IHubClients> _clientsMock;
        private Mock<ITimeSlotRepository> _timeSlotRepositoryMock;
        private KhanhAnNeurologyClinicContext _context;
        private Mock<IExaminationResultRepository> _examinationResultRepository;

        [SetUp]
        public void SetUp()
        {
            var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;
            _context = new KhanhAnNeurologyClinicContext(options);

            _authServiceMock = new Mock<IAuthService>();
            _appointmentRepositoryMock = new Mock<IAppointmentRepository>();
            _userRepositoryMock = new Mock<IUserRepository>();
            _emailServiceMock = new Mock<IEmailService>();
            _auditLogRepositoryMock = new Mock<IAuditLogRepository>();
            _visitRepositoryMock = new Mock<IVisitRepository>();
            _visitServiceMock = new Mock<IVisitService>();
            _assignmentServiceMock = new Mock<IAssignmentService>();
            _timeSlotRepositoryMock = new Mock<ITimeSlotRepository>();
            _examinationResultRepository = new Mock<IExaminationResultRepository>();


            _hubContextMock = new Mock<IHubContext<KhanhAnHub>>();
            _clientProxyMock = new Mock<IClientProxy>();
            _clientsMock = new Mock<IHubClients>();
            _clientsMock.Setup(c => c.All).Returns(_clientProxyMock.Object);
            _hubContextMock.Setup(h => h.Clients).Returns(_clientsMock.Object);

            _service = new AppointmentService(
                _context,
                _authServiceMock.Object,
                _auditLogRepositoryMock.Object,
                _appointmentRepositoryMock.Object,
                _userRepositoryMock.Object,
                _emailServiceMock.Object,
                _visitRepositoryMock.Object,
                _visitServiceMock.Object,
                _assignmentServiceMock.Object,
                null,
                _hubContextMock.Object,
                _timeSlotRepositoryMock.Object,
                _examinationResultRepository.Object
            );
        }

        [Test]
        public async Task GetAll_ShouldReturnPaginatedAppointments()
        {
            // Arrange
            var appointments = new List<AppointmentResponseDTO>
    {
        new AppointmentResponseDTO { Id = "appt-1", Name = "Alice" },
        new AppointmentResponseDTO { Id = "appt-2", Name = "Bob" }
    };
            int totalItems = 2;
            int pageNumber = 1;
            int pageSize = 10;

            _appointmentRepositoryMock.Setup(r => r.FindAll(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<string>(),
                pageNumber,
                pageSize))
                .ReturnsAsync((appointments, totalItems));

            // Act
            var result = await _service.GetAll(null, null, null, null, null, null, pageNumber, pageSize);

            // Assert
            Assert.AreEqual(2, result.TotalItems);
            Assert.AreEqual(2, result.Items.Count());
            Assert.AreEqual(pageNumber, result.PageNumber);
            Assert.AreEqual(pageSize, result.PageSize);
        }

        [TestFixture]
        public class AppointmentServiceTests
        {
            private AppointmentService _service;
            private Mock<IAppointmentRepository> _appointmentRepositoryMock;
            // Các mock khác...

            [SetUp]
            public void SetUp()
            {
                var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
                    .UseInMemoryDatabase(Guid.NewGuid().ToString())
                    .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                    .Options;
                var context = new KhanhAnNeurologyClinicContext(options);

                _appointmentRepositoryMock = new Mock<IAppointmentRepository>();
                // Các mock khác như bạn đã setup...

                _service = new AppointmentService(
                    context,
                    new Mock<IAuthService>().Object,
                    new Mock<IAuditLogRepository>().Object,
                    _appointmentRepositoryMock.Object,
                    new Mock<IUserRepository>().Object,
                    new Mock<IEmailService>().Object,
                    new Mock<IVisitRepository>().Object,
                    new Mock<IVisitService>().Object,
                    new Mock<IAssignmentService>().Object,
                    null,
                    new Mock<IHubContext<KhanhAnHub>>().Object,
                    new Mock<ITimeSlotRepository>().Object,
                    new Mock<IExaminationResultRepository>().Object
                );
            }

            [Test]
            public async Task GetById_ShouldReturnAppointment_WhenAppointmentExists()
            {
                // Arrange
                var appointmentId = "appt-123";
                var appointment = new Appointment
                {
                    Id = appointmentId,
                    Name = "John Doe",
                    PhoneNumber = "0123456789",
                    Email = "john@example.com",
                    DateOfBirth = new DateTime(1990, 1, 1),
                    Gender = "Male",
                    Address = "123 Street",
                    Symptom = "Headache",
                    RequiredDoctorId = "doc-1",
                    Date = new DateTime(2025, 8, 1),
                    TimeSlotId = "slot-1",
                    Status = AppointmentStatus.WAITING_FOR_CONFIRMATION,
                    TotalPrice = 500_000,
                    ExpiredAt = DateTime.UtcNow.AddHours(1),
                    CreatedAt = DateTime.UtcNow
                };

                _appointmentRepositoryMock.Setup(r => r.FindById(appointmentId))
                    .ReturnsAsync(appointment);

                // Act
                var result = await _service.GetById(appointmentId);

                // Assert
                Assert.IsNotNull(result);
                Assert.AreEqual(appointmentId, result.Id);
                Assert.AreEqual("John Doe", result.Name);
                Assert.AreEqual("0123456789", result.PhoneNumber);
                Assert.AreEqual("john@example.com", result.Email);
            }

            [Test]
            public void GetById_ShouldThrowNotFoundException_WhenAppointmentDoesNotExist()
            {
                // Arrange
                var appointmentId = "nonexistent";
                _appointmentRepositoryMock.Setup(r => r.FindById(appointmentId))
                    .ReturnsAsync((Appointment?)null);

                // Act + Assert
                var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.GetById(appointmentId));
                Assert.That(ex.Message, Is.EqualTo(MessageConstants.APPOINTMENT_NOT_FOUND));
            }
        }


    }
}
