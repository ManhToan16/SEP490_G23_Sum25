using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.DTO.ScheduleDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.ScheduleChangeRepositories;
using SEP490_BE.Repositories.ScheduleRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.ScheduleServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.ScheduleTest
{
    [TestFixture]
    public class UpdateScheduleTests
    {
        private ScheduleService _service;
        private KhanhAnNeurologyClinicContext _context;
        private Mock<IScheduleRepository> _scheduleRepoMock;
        private Mock<IUserRepository> _userRepoMock;
        private Mock<IScheduleChangeRepository> _scheduleChangeRepoMock;
        private Mock<IAuthService> _authServiceMock;
        private Mock<IAuditLogRepository> _logRepoMock;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new KhanhAnNeurologyClinicContext(options);

            _scheduleRepoMock = new Mock<IScheduleRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _scheduleChangeRepoMock = new Mock<IScheduleChangeRepository>();
            _authServiceMock = new Mock<IAuthService>();
            _logRepoMock = new Mock<IAuditLogRepository>();

            _service = new ScheduleService(
                _context,
                _scheduleRepoMock.Object,
                _userRepoMock.Object,
                _scheduleChangeRepoMock.Object,
                _authServiceMock.Object,
                _logRepoMock.Object
            );
        }

        //[Test]
        //public async Task UpdateSchedule_ValidRequest_UpdatesSuccessfully()
        //{
        //    // Arrange
        //    var scheduleId = "sch1";
        //    var existingSchedule = new Schedule
        //    {
        //        Id = scheduleId,
        //        UserId = "u1",
        //        RoomId = "r1",
        //        RoomType = "EXAMINATION",
        //        Date = DateTime.Today,
        //        TimeSlotId = "ts1",
        //        Status = ScheduleStatus.PRESENT.ToString(),
        //        Role = "DOCTOR",
        //        User = new User { Id = "u1", Name = "Dr. Strange" }
        //    };

        //    _scheduleRepoMock.Setup(r => r.FindByIdAsync(scheduleId)).ReturnsAsync(existingSchedule);
        //    _context.TimeSlots.Add(new TimeSlot { Id = "ts2", Name = "Ca Chiều", StartTime = new TimeSpan(13, 0, 0), EndTime = new TimeSpan(17, 0, 0) });
        //    _context.ExaminationRooms.Add(new ExaminationRoom { Id = "r2", Name = "Phòng 102" });
        //    await _context.SaveChangesAsync();

        //    _authServiceMock.Setup(a => a.GetAuthenticatedUser()).ReturnsAsync(new User { Id = "admin" });
        //    _scheduleRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Schedule>())).Returns(Task.CompletedTask);
        //    _logRepoMock.Setup(r => r.LogAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<object>(), It.IsAny<object>())).Returns(Task.CompletedTask);

        //    var updateDto = new UpdateScheduleDTO
        //    {
        //        RoomId = "r2",
        //        TimeSlotId = "ts2",
        //        Status = "ABSENT"
        //    };

        //    // Act
        //    var result = await _service.UpdateSchedule(scheduleId, updateDto);

        //    // Assert
        //    Assert.That(result.Id, Is.EqualTo(scheduleId));
        //    Assert.That(result.RoomId, Is.EqualTo("r2"));
        //    Assert.That(result.TimeSlotId, Is.EqualTo("ts2"));
        //    Assert.That(result.Status, Is.EqualTo("ABSENT"));
        //    Assert.That(result.RoomType, Is.EqualTo("EXAMINATION"));


        //}

        [Test]
        public void UpdateSchedule_NotFound_ThrowsException()
        {
            _scheduleRepoMock.Setup(r => r.FindByIdAsync("notfound")).ReturnsAsync((Schedule?)null);
            var updateDto = new UpdateScheduleDTO { RoomId = "r1" };
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () => await _service.UpdateSchedule("notfound", updateDto));
            Assert.That(ex.Message, Does.Contain("Không tìm thấy lịch."));
        }

        [Test]
        public void UpdateSchedule_InvalidRoom_ThrowsException()
        {
            var scheduleId = "sch2";
            _scheduleRepoMock.Setup(r => r.FindByIdAsync(scheduleId)).ReturnsAsync(new Schedule { Id = scheduleId });
            var updateDto = new UpdateScheduleDTO { RoomId = "invalidRoom" };
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () => await _service.UpdateSchedule(scheduleId, updateDto));
            Assert.That(ex.Message, Does.Contain("Không tìm thấy phòng"));
        }

        [Test]
        public void UpdateSchedule_InvalidTimeSlot_ThrowsException()
        {
            var scheduleId = "sch3";
            _scheduleRepoMock.Setup(r => r.FindByIdAsync(scheduleId)).ReturnsAsync(new Schedule { Id = scheduleId, RoomId = "r1" });
            _context.ExaminationRooms.Add(new ExaminationRoom { Id = "r1",  Name = "Phòng khám 1", IsActive = true });
            _context.SaveChanges();
            var updateDto = new UpdateScheduleDTO { RoomId = "r1", TimeSlotId = "invalidTS" };
           var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () => await _service.UpdateSchedule(scheduleId, updateDto));
            Assert.That(ex.Message, Does.Contain(" Không tìm thấy khoảng thời gian mới"));
        }

       
    }
}
