using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.Constants;
using SEP490_BE.DTO.VisitDTO;
using SEP490_BE.Entities;
using SEP490_BE.Hubs;
using SEP490_BE.Repositories.AppointmentRepositories;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.ExaminationResultRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Repositories.VisitRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.EmailServices;
using SEP490_BE.Services.VisitServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;
using SEP490_BE.Exceptions;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Test2.Services.VisitTest
{

    [TestFixture]
    public class VisitServiceTests
    {
        private KhanhAnNeurologyClinicContext _context;
        private VisitService _visitService;
        private Mock<IAuthService> _authServiceMock;
        private Mock<IAuditLogRepository> _logRepositoryMock;
        private Mock<IAppointmentRepository> _appointmentRepositoryMock;
        private Mock<IUserRepository> _userRepositoryMock;
        private Mock<IEmailService> _emailServiceMock;
        private Mock<IVisitRepository> _visitRepositoryMock;
        private Mock<IExaminationResultRepository> _examinationResultRepositoryMock;
        private Mock<IHubContext<KhanhAnHub>> _hubContextMock;
        private Mock<IClientProxy> _clientProxyMock;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning)) // <- dòng này suppress lỗi
                .Options;


            _context = new KhanhAnNeurologyClinicContext(options);

            _authServiceMock = new Mock<IAuthService>();
            _logRepositoryMock = new Mock<IAuditLogRepository>();
            _appointmentRepositoryMock = new Mock<IAppointmentRepository>();
            _userRepositoryMock = new Mock<IUserRepository>();
            _emailServiceMock = new Mock<IEmailService>();
            _visitRepositoryMock = new Mock<IVisitRepository>();
            _examinationResultRepositoryMock = new Mock<IExaminationResultRepository>();

            _clientProxyMock = new Mock<IClientProxy>();
            var mockClients = new Mock<IHubClients>();
            mockClients.Setup(c => c.All).Returns(_clientProxyMock.Object);

            _hubContextMock = new Mock<IHubContext<KhanhAnHub>>();
            _hubContextMock.Setup(x => x.Clients).Returns(mockClients.Object);

            _visitService = new VisitService(
                _context,
                _authServiceMock.Object,
                _logRepositoryMock.Object,
                _appointmentRepositoryMock.Object,
                _userRepositoryMock.Object,
                _emailServiceMock.Object,
                _visitRepositoryMock.Object,
                _examinationResultRepositoryMock.Object,
                _hubContextMock.Object
            );
        }

        [Test]
        public async Task CreateVisit_Success()
        {
            // Arrange
            var today = DateTime.UtcNow.Date;

            var room = new ExaminationRoom { Id = "room1", Name = "Phòng 1",IsActive = true };
            var patient = new PatientProfile
            {
                Id = "patient1",
                Name = "Bệnh nhân A",
                CitizenId = "123456789",
                PhoneNumber = "0123456789",
                Email = "patient@example.com",
                Gender = "Male",
                DateOfBirth = new DateTime(1990, 1, 1)
            };

            var doctor = new User
            {
                Id = "doc1",
                Name = "Bác sĩ B",
                Email = "doctor@example.com",
                Gender = "Male",
                Password = "hashed-password", // hoặc chuỗi giả
                PhoneNumber = "0987654321"
            };

            var timeSlot = new TimeSlot
            {
                Id = "slot1",
                Name = "Ca 1",
                StartTime = new TimeSpan(8, 0, 0),   // 08:00
                EndTime = new TimeSpan(9, 0, 0)      // 09:00
            };


            var appointment = new Appointment
            {
                Id = "appt1",
                Name = "Nguyễn Văn A",
                PhoneNumber = "0123456789",
                Email = "a@example.com",
                Gender = "Male",
                TimeSlotId = "slot1",
                Status = AppointmentStatus.CHECKED_IN,
                RequiredDoctorId = doctor.Id,
                Date = DateTime.Today,
            };


            _context.TimeSlots.Add(timeSlot);
            _context.ExaminationRooms.Add(room);
            _context.PatientProfiles.Add(patient);
            _context.Users.Add(doctor);
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            var request = new VisitRequestDTO
            {
                ExaminationRoomId = room.Id,
                AppointmentId = appointment.Id,
                PatientProfileId = patient.Id,
                AssignedDoctorId = doctor.Id,
                IsPrioritized = false
            };

            _visitRepositoryMock.Setup(r => r.Insert(It.IsAny<Visit>()))
                .Callback<Visit>(v =>
                {
                    v.AssignedDoctor = doctor;
                    v.ExaminationRoom = room;
                    v.PatientProfile = patient;
                });


            // Act
            var result = await _visitService.Create(request);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(room.Id, result.ExaminationRoomId);
            Assert.AreEqual(patient.Name, result.PatientName);
            Assert.AreEqual(doctor.Id, result.AssignedDoctorId);
            Assert.AreEqual(1, result.QueueNumber);



            _visitRepositoryMock.Verify(r => r.Insert(It.IsAny<Visit>()), Times.Once);
            _appointmentRepositoryMock.Verify(r => r.Update(It.IsAny<Appointment>()), Times.Once);
            _clientProxyMock.Verify(c =>
                c.SendCoreAsync("VisitChanged", It.IsAny<object[]>(), default), Times.Once);
        }

        [Test]
        public async Task GetById_Success()
        {
            // Arrange
            var visit = new Visit
            {
                Id = "visit1",
                ExaminationRoomId = "room1",
                ExaminationRoom = new ExaminationRoom { Id = "room1", Name = "Phòng 1" },
                AppointmentId = "appt1",
                AssignedDoctorId = "doc1",
                AssignedDoctor = new User { Id = "doc1", Name = "Dr. A" },
                PatientProfileId = "patient1",
                PatientName = "Nguyễn Văn A",
                QueueNumber = 1,
                TotalPrice = 500000,
                Status = "WAITING",
                IsPrioritized = true
            };

            _visitRepositoryMock.Setup(r => r.FindById("visit1"))
                .ReturnsAsync(visit);

            // Act
            var result = await _visitService.GetById("visit1");

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("visit1", result.VisitId);
            Assert.AreEqual("Phòng 1", result.ExaminationRoomName);
            Assert.AreEqual("Dr. A", result.AssignedDoctorName);
            Assert.AreEqual("Nguyễn Văn A", result.PatientName);
        }

        [Test]
        public void GetById_VisitNotFound_ThrowsException()
        {
            // Arrange
            _visitRepositoryMock.Setup(r => r.FindById("notfound")).ReturnsAsync((Visit?)null);

            // Act + Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(
                async () => await _visitService.GetById("notfound")
            );

            Assert.That(ex!.Message, Is.EqualTo(MessageConstants.VISIT_NOT_FOUND));
        }

        [Test]
        public async Task GetVisits_Success()
        {
            // Arrange
            var date = DateTime.Today;
            var examinationRoomId = "room1";
            var status = "WAITING";

            var visits = new List<VisitResponseDTO>
    {
        new VisitResponseDTO
        {
            VisitId = "visit1",
            ExaminationRoomId = "room1",
            ExaminationRoomName = "Phòng 1",
            AssignedDoctorId = "doc1",
            AssignedDoctorName = "Dr. A",
            PatientProfileId = "patient1",
            PatientName = "Nguyễn Văn A",
            QueueNumber = 1,
            TotalPrice = 500000,
            Status = "WAITING",
            IsPrioritized = true
        }
    };

            _visitRepositoryMock.Setup(r =>
                r.GetVisits(examinationRoomId, status, date, 1, 10))
                .ReturnsAsync((visits, 1));

            // Act
            var result = await _visitService.GetVisits(examinationRoomId, status, date, 1, 10);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.TotalItems);
            Assert.AreEqual(1, result.Items.Count);
            Assert.AreEqual("visit1", result.Items[0].VisitId);
            Assert.AreEqual("Phòng 1", result.Items[0].ExaminationRoomName);
        }

        [Test]
        public async Task GetById_ShouldReturnVisitResponse_WhenVisitExists()
        {
            var visitId = "visit123";
            var visit = new Visit
            {
                Id = visitId,
                ExaminationRoomId = "room1",
                ExaminationRoom = new ExaminationRoom { Name = "Phòng 1" },
                AppointmentId = "app1",
                AssignedDoctorId = "doc1",
                AssignedDoctor = new User { Name = "Dr. House" },
                PatientProfileId = "pat1",
                PatientName = "Nguyen Van A",
                QueueNumber = 1,
                TotalPrice = 100000,
                Status = "WAITING",
                IsPrioritized = false
            };

            _visitRepositoryMock.Setup(r => r.FindById(visitId)).ReturnsAsync(visit);

            var result = await _visitService.GetById(visitId);

            Assert.AreEqual(visit.Id, result.VisitId);
            Assert.AreEqual("Phòng 1", result.ExaminationRoomName);
        }

        [Test]
        public async Task GetVisits_ShouldReturnPagination_WhenCalled()
        {
            var visitList = new List<VisitResponseDTO> { new VisitResponseDTO { VisitId = "v1" } };
            _visitRepositoryMock.Setup(r => r.GetVisits("room1", "WAITING", It.IsAny<DateTime>(), 1, 10))
                .ReturnsAsync((visitList, 1));

            var result = await _visitService.GetVisits("room1", "WAITING", DateTime.Today, 1, 10);

            Assert.AreEqual(1, result.TotalItems);
            Assert.AreEqual("v1", result.Items.First().VisitId);
        }

        [Test]
        public async Task GetByAppointmentId_ShouldReturnVisit_WhenFound()
        {
            var visit = new Visit
            {
                Id = "v1",
                AppointmentId = "a1",
                ExaminationRoom = new ExaminationRoom { Name = "Phòng A" },
                AssignedDoctor = new User { Name = "Dr. A" },
                PatientProfileId = "p1",
                PatientName = "Nguyen Van B",
                QueueNumber = 2
            };
            _visitRepositoryMock.Setup(r => r.FindByAppointmentId("a1")).ReturnsAsync(visit);

            var result = await _visitService.GetByAppointmentId("a1");

            Assert.AreEqual("v1", result.VisitId);
            Assert.AreEqual("Phòng A", result.ExaminationRoomName);
        }

        [Test]
        public async Task MarkAsComplete_ShouldCompleteVisitSuccessfully_WhenValid()
        {
            // Arrange
            var visitId = "visit-1";
            var appointment = new Appointment
            {
                Id = "appt-1",
                Email = "patient@example.com",
                PhoneNumber = "0123456789",
                Name = "Patient A",
                Date = DateTime.Today,
                DateOfBirth = new DateTime(1990, 1, 1),
                Status = AppointmentStatus.IN_LABORATORY_PROGRESS
            };
            var visit = new Visit
            {
                Id = visitId,
                Status = VisitStatus.RETURNING,
                Appointment = appointment,
                AppointmentId = appointment.Id,
                ExaminationRoomId = "room-1",
                ExaminationRoom = new ExaminationRoom { Name = "Room A", IsActive = true },
                AssignedDoctorId = "doc-1",
                AssignedDoctor = new User { Name = "Dr. A" },
                PatientProfileId = "patient-1",
                PatientName = "Patient A",
                QueueNumber = 1,
                TotalPrice = 200000,
                IsPrioritized = true
            };
            var examResult = new ExaminationResult
            {
                Id = "exam-1",
                VisitId = visitId,
                AccessCode = "ABC123"
            };

            _visitRepositoryMock.Setup(x => x.FindById(visitId)).ReturnsAsync(visit);
            _context.Assignments.Add(new Assignment
            {
                Id = "ass-1",
                VisitId = "visit-1",
                LaboratoryRoomId = "room-1", 
                LaboratoryRoom = new LaboratoryRoom
                {
                    Id = "room-1",
                    Name = "Test Room",
                    IsActive = true
                },
                TotalPrice = 100000,
                Status = AssignmentStatus.COMPLETED
            });

            await _context.SaveChangesAsync();



            _examinationResultRepositoryMock.Setup(x => x.FindByVisitIdAsync(visitId)).ReturnsAsync(examResult);
            _appointmentRepositoryMock.Setup(x => x.Update(It.IsAny<Appointment>())).Returns(Task.CompletedTask);
            _visitRepositoryMock.Setup(x => x.Update(It.IsAny<Visit>())).Returns(Task.CompletedTask);
            _emailServiceMock.Setup(x => x.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                             .Returns(Task.CompletedTask);
            _clientProxyMock.Setup(x => x.SendCoreAsync(It.IsAny<string>(), It.IsAny<object[]>(), default)).Returns(Task.CompletedTask);

            // Act
            var result = await _visitService.MarkAsComplete(visitId);

            // Assert
            Assert.That(result.Status, Is.EqualTo(VisitStatus.COMPLETED));
            Assert.That(result.ExaminationRoomName, Is.EqualTo("Room A"));
            Assert.That(result.AssignedDoctorName, Is.EqualTo("Dr. A"));
            Assert.That(result.PatientName, Is.EqualTo("Patient A"));
        }

        [Test]
        public void MarkAsComplete_ShouldThrow_WhenAssignmentsIncomplete()
        {
            // Arrange
            var visitId = "visit-1";
            var visit = new Visit
            {
                Id = visitId,
                Status = VisitStatus.RETURNING,
                Appointment = new Appointment { Status = AppointmentStatus.IN_LABORATORY_PROGRESS }
            };
            _visitRepositoryMock.Setup(x => x.FindById(visitId)).ReturnsAsync(visit);
            _context.Assignments.Add(new Assignment
            {
                Id = "ass-1",
                VisitId = "visit-1",
                LaboratoryRoomId = "room-1",
                LaboratoryRoom = new LaboratoryRoom
                {
                    Id = "room-1",
                    Name = "Test Room",
                    IsActive = true
                },
                TotalPrice = 100000,
                Status = AssignmentStatus.IN_PROGRESS
            });

            _context.SaveChanges();

            // Act & Assert
            var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(() => _visitService.MarkAsComplete(visitId));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.VISIT_INVALID_COMPLETED));
        }

        [Test]
        public async Task Calling_ShouldUpdateStatus_WhenVisitIsWaiting()
        {
            // Arrange
            var visitId = "visit-1";
            var visit = new Visit
            {
                Id = visitId,
                Status = VisitStatus.WAITING,
                ExaminationRoomId = "room-1",
                ExaminationRoom = new ExaminationRoom { Name = "Room A" },
                AssignedDoctor = new User { Name = "Dr. A" }
            };
            _visitRepositoryMock.Setup(x => x.FindById(visitId)).ReturnsAsync(visit);
            _visitRepositoryMock.Setup(x => x.Update(It.IsAny<Visit>())).Returns(Task.CompletedTask);
            _clientProxyMock.Setup(x => x.SendCoreAsync(It.IsAny<string>(), It.IsAny<object[]>(), default)).Returns(Task.CompletedTask);

            // Act
            var result = await _visitService.Calling(visitId);

            // Assert
            Assert.That(result.Status, Is.EqualTo(VisitStatus.IN_EXAMINATION));
            Assert.That(result.ExaminationRoomName, Is.EqualTo("Room A"));
        }

        [Test]
        public void Calling_ShouldThrow_WhenVisitStatusInvalid()
        {
            // Arrange
            var visitId = "visit-1";
            var visit = new Visit { Id = visitId, Status = VisitStatus.COMPLETED };
            _visitRepositoryMock.Setup(x => x.FindById(visitId)).ReturnsAsync(visit);

            // Act & Assert
            var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(() => _visitService.Calling(visitId));
            Assert.That(ex.Message, Is.EqualTo(MessageConstants.VISIT_INVALID_CALLING));
        }

        [Test]
        public async Task GetByPatientProfileId_ShouldReturnVisit_WhenFound()
        {
            var visit = new Visit
            {
                Id = "v1",
                AppointmentId = "a1",
                ExaminationRoom = new ExaminationRoom { Name = "Phòng A" },
                AssignedDoctor = new User { Name = "Dr. A" },
                PatientProfileId = "p1",
                PatientName = "Nguyen Van B",
                QueueNumber = 2
            };
            _visitRepositoryMock.Setup(r => r.FindByAppointmentId("a1")).ReturnsAsync(visit);

            var result = await _visitService.GetByAppointmentId("a1");

            Assert.AreEqual("v1", result.VisitId);
            Assert.AreEqual("Phòng A", result.ExaminationRoomName);
        }

    }



}
