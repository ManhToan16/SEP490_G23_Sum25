using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using SEP490_BE.Entities;
using SEP490_BE.Hubs;
using SEP490_BE.Repositories.AppointmentRepositories;
using SEP490_BE.Repositories.AuditLogRepositories;
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
using SEP490_BE.Constants;
using SEP490_BE.DTO.AppointmentDTO;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.TimeSlotRepositories;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Test2.Services.AppointmentTest
{
    [TestFixture]
    public class CreateAppointmentTest
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
                _timeSlotRepositoryMock.Object
            );
        }

        [Test]
        public async Task CreateAppointment_Success()
        {
            // Arrange
            var doctor = new User { Id = "doc1", Name = "Dr. House" };
            var timeSlot = new TimeSlot
            {
                Id = "TS001",
                Name = "Morning Slot",
                StartTime = TimeSpan.FromHours(9),
                EndTime = TimeSpan.FromHours(10)
            };
            _context.TimeSlots.Add(timeSlot);
            await _context.SaveChangesAsync();

            var request = new AppointmentRequestDTO
            {
                Name = "Patient A",
                PhoneNumber = "0123456789",
                Email = "patient@example.com",
                Gender = "Male",
                DateOfBirth = new DateTime(1990, 1, 1),
                Address = "Hanoi",
                Symptom = "Fever",
                RequiredDoctorId = doctor.Id,
                TimeSlotId = "TS001",
                Date = DateTime.Today
            };

            _userRepositoryMock.Setup(r => r.FindById(doctor.Id)).ReturnsAsync(doctor);
            _appointmentRepositoryMock.Setup(r => r.Insert(It.IsAny<Appointment>())).Returns(Task.CompletedTask);
            _emailServiceMock.Setup(r => r.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(Task.CompletedTask);
            _clientProxyMock.Setup(c => c.SendCoreAsync(It.IsAny<string>(), It.IsAny<object[]>(), default)).Returns(Task.CompletedTask);

            _appointmentRepositoryMock.Setup(r => r.Insert(It.IsAny<Appointment>()))
                .Callback<Appointment>(v =>
                {
                    v.RequiredDoctor = doctor;
                    v.TimeSlot = timeSlot;
                });

            // Act
            var result = await _service.Create(request);

            // Assert
            Assert.NotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(request.PhoneNumber, result.PhoneNumber);
            Assert.AreEqual(request.RequiredDoctorId, result.RequiredDoctorId);
        }

        [Test]
        public void CreateAppointment_DoctorNotFound_ShouldThrow()
        {
            // Arrange
            var request = new AppointmentRequestDTO
            {
                RequiredDoctorId = "invalid-doctor",
                TimeSlotId = "slot1",
                Date = DateTime.Today
            };

            _userRepositoryMock.Setup(r => r.FindById("invalid-doctor")).ReturnsAsync((User)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Create(request));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.DOCTOR_NOT_FOUND));
        }

        [Test]
        public void CreateAppointment_TimeSlotNotFound_ShouldThrow()
        {
            // Arrange
            var request = new AppointmentRequestDTO
            {
                RequiredDoctorId = "doc1",
                TimeSlotId = "invalid-slot",
                Date = DateTime.Today
            };

            _userRepositoryMock.Setup(r => r.FindById("doc1")).ReturnsAsync(new User());

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Create(request));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.TIMESLOT_NOT_FOUND));
        }

    }
}
