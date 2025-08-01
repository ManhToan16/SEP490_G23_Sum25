using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
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
    public class DeleteScheduleTests
    {
        private ScheduleService _service;
        private Mock<IScheduleRepository> _scheduleRepoMock;
        private Mock<IUserRepository> _userRepoMock;
        private Mock<IScheduleChangeRepository> _scheduleChangeRepoMock;
        private Mock<IAuthService> _authServiceMock;
        private Mock<IAuditLogRepository> _logRepoMock;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock;
        private Mock<DatabaseFacade> _databaseMock;
        private Mock<IDbContextTransaction> _transactionMock;

        [SetUp]
        public void Setup()
        {
            _scheduleRepoMock = new Mock<IScheduleRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _scheduleChangeRepoMock = new Mock<IScheduleChangeRepository>();
            _authServiceMock = new Mock<IAuthService>();
            _logRepoMock = new Mock<IAuditLogRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>();
            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();

            _databaseMock.Setup(db => db.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _service = new ScheduleService(
                _contextMock.Object,
                _scheduleRepoMock.Object,
                _userRepoMock.Object,
                _scheduleChangeRepoMock.Object,
                _authServiceMock.Object,
                _logRepoMock.Object);
        }

        //[Test]
        //public async Task DeleteSchedule_ValidId_SuccessfullyDeletes()
        //{
        //    // Arrange
        //    var schedule = new Schedule
        //    {
        //        Id = "schedule-123",
        //        UserId = "user-456",
        //        Date = DateTime.Today,
        //        TimeSlotId = "slot-1"
        //    };

        //    _scheduleRepoMock
        //        .Setup(r => r.FindByIdAsync("schedule-123"))
        //        .ReturnsAsync(schedule);

        //    _scheduleChangeRepoMock
        //        .Setup(r => r.DeleteByScheduleAsync(
        //            schedule.UserId,
        //            schedule.Id,
        //            schedule.Date,
        //            schedule.TimeSlotId))
        //        .Returns(Task.CompletedTask);

        //    _contextMock
        //        .Setup(c => c.Schedules.Remove(It.IsAny<Schedule>()));

        //    _contextMock
        //        .Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
        //        .ReturnsAsync(1);

        //    _databaseMock
        //        .Setup(db => db.BeginTransactionAsync(It.IsAny<CancellationToken>()))
        //        .ReturnsAsync(_transactionMock.Object);

        //    _contextMock
        //        .Setup(c => c.Database).Returns(_databaseMock.Object);

        //    // Act
        //    await _service.DeleteSchedule("schedule-123");

        //    // Assert
        //    _scheduleChangeRepoMock.Verify(r =>
        //        r.DeleteByScheduleAsync(schedule.UserId, schedule.Id, schedule.Date, schedule.TimeSlotId),
        //        Times.Once);

        //    _scheduleRepoMock.Verify(r => r.DeleteAsync("schedule-123"), Times.Once);

        //    _contextMock.Verify(c => c.Schedules.Remove(schedule), Times.Once);
        //    _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        //    _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
        //}


        [Test]
        public void DeleteSchedule_InvalidId_ThrowsNotFound()
        {
            // Arrange
            _scheduleRepoMock.Setup(r => r.FindByIdAsync("invalid-id")).ReturnsAsync((Schedule)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () => await _service.DeleteSchedule("invalid-id"));
            Assert.That(ex.Message, Is.EqualTo("Không tìm thấy lịch."));
        }

        [Test]
        public void DeleteSchedule_FailureDuringTransaction_RollsBack()
        {
            // Arrange
            var schedule = new Schedule
            {
                Id = "1",
                UserId = "user-1",
                Date = DateTime.UtcNow.Date,
                TimeSlotId = "slot-1"
            };
            _scheduleRepoMock.Setup(r => r.FindByIdAsync("1")).ReturnsAsync(schedule);
            _scheduleRepoMock.Setup(r => r.DeleteAsync(schedule.Id)).ThrowsAsync(new Exception("Failed to delete"));

            // Act & Assert
            Assert.ThrowsAsync<Exception>(async () => await _service.DeleteSchedule("1"));
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
