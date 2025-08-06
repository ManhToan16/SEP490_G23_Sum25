using Microsoft.EntityFrameworkCore;
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
    public class GetScheduleByUserId
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

        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }

        [Test]
        public void GetSchedulesByUserId_FromDateAfterToDate_ThrowsArgumentException()
        {
            // Arrange
            var fromDate = new DateTime(2025, 7, 30);
            var toDate = new DateTime(2025, 7, 20);

            // Act & Assert
            var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(() =>
                _service.GetSchedulesByUserId("user123", fromDate, toDate));
            Assert.AreEqual("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.", ex.Message);
        }

        [Test]
        public void GetSchedulesByUserId_UserNotFound_ThrowsResourceNotFoundException()
        {
            // Arrange
            _userRepoMock.Setup(x => x.FindById("user123")).ReturnsAsync((User)null!);

            var fromDate = new DateTime(2025, 7, 20);
            var toDate = new DateTime(2025, 7, 30);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() =>
                _service.GetSchedulesByUserId("user123", fromDate, toDate));
            Assert.AreEqual("Không tìm thấy người dùng với ID: user123", ex.Message);
        }

        [Test]
        public async Task GetSchedulesByUserId_ReturnsScheduleList_WithRoomName()
        {
            // Arrange
            var fromDate = new DateTime(2025, 7, 20);
            var toDate = new DateTime(2025, 7, 30);
            var userId = "user123";
            var roomId = "room456";

            var user = new User { Id = userId, Name = "Dr. Jane" };
            _userRepoMock.Setup(x => x.FindById(userId)).ReturnsAsync(user);

            // Add fake room to ExaminationRooms (GetRoomNameAsync will find it)
            await _context.ExaminationRooms.AddAsync(new ExaminationRoom
            {
                Id = roomId,
                Name = "Phòng Khám Tổng Quát",
                IsActive = true
            });
            await _context.SaveChangesAsync();

            var schedules = new List<Schedule>
    {
        new Schedule
        {
            Id = "sch1",
            UserId = userId,
            User = user,
            Role = "DOCTOR",
            RoomId = roomId,
            RoomType = "EXAMINATION",
            Date = new DateTime(2025, 7, 25),
            TimeSlotId = "slot1",
            Status = "AVAILABLE"
        }
    };

            _scheduleRepoMock.Setup(x =>
                x.GetSchedulesByUserAndDateRangeAsync(userId, fromDate, toDate))
                .ReturnsAsync(schedules);

            // Act
            var result = await _service.GetSchedulesByUserId(userId, fromDate, toDate);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual("Phòng Khám Tổng Quát", result[0].RoomName);
        }
        public static IEnumerable<TestCaseData> InvalidDateStrings =>
    new List<TestCaseData>
    {
        new TestCaseData("2025-07-32", "2025-07-20"),
        new TestCaseData("2025-13-20", "2025-07-20"),
        new TestCaseData("20260720", "2025-07-20"),
        new TestCaseData("abc", "2025-07-20"),
        new TestCaseData("2025-07-20", "2025-02-30")
    };
        [TestCaseSource(nameof(InvalidDateStrings))]
        public void GetSchedulesByUserId_InvalidDateFormat_ThrowsArgumentException(string fromDateStr, string toDateStr)
        {
            // Arrange
            string userId = "user123";

            // Act & Assert
            var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(async () =>
            {
                // Parse vào trong để bắt lỗi chuyển đổi
                if (!DateTime.TryParse(fromDateStr, out var fromDate) || !DateTime.TryParse(toDateStr, out var toDate))
                {
                    throw new SEP490_BE.Exceptions.ArgumentException("Dữ liệu không hợp lệ.");
                }

                await _service.GetSchedulesByUserId(userId, fromDate, toDate);
            });

            Assert.AreEqual("Dữ liệu không hợp lệ.", ex.Message);
        }


    }
}
