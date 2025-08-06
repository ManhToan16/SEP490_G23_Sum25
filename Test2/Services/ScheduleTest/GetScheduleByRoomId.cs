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
    public class GetScheduleByRoomId
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
        public void GetSchedulesByRoomId_FromDateAfterToDate_ThrowsArgumentException()
        {
            var fromDate = new DateTime(2025, 7, 30);
            var toDate = new DateTime(2025, 7, 20);

            var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(() =>
                _service.GetSchedulesByRoomId("room123", fromDate, toDate));
            Assert.AreEqual("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.", ex.Message);
        }

        [Test]
        public void GetSchedulesByRoomId_RoomNotFound_ThrowsResourceNotFoundException()
        {
            var fromDate = new DateTime(2025, 7, 20);
            var toDate = new DateTime(2025, 7, 30);

            // Room không có trong DB
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() =>
                _service.GetSchedulesByRoomId("room_not_found", fromDate, toDate));
            Assert.AreEqual("Không tìm thấy phòng.", ex.Message);
        }

        [Test]
        public async Task GetSchedulesByRoomId_ReturnsScheduleList_WithUserName()
        {
            var fromDate = new DateTime(2025, 7, 20);
            var toDate = new DateTime(2025, 7, 30);
            var userId = "user123";
            var roomId = "room456";

            var user = new User
            {
                Id = userId,
                Name = "Dr. Jane",
                Email = "jane@example.com",
                Gender = "Female",
                Password = "hashedPassword",
                PhoneNumber = "0123456789"
            };

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
                x.GetSchedulesByRoomAndDateRangeAsync(roomId, fromDate, toDate))
                .ReturnsAsync(schedules);

            var result = await _service.GetSchedulesByRoomId(roomId, fromDate, toDate);

            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual("Dr. Jane", result[0].UserName);
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
        public void GetSchedulesByRoomId_InvalidDateFormat_ThrowsArgumentException(string fromDateStr, string toDateStr)
        {
            string roomId = "room123";

            var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(async () =>
            {
                if (!DateTime.TryParse(fromDateStr, out var fromDate) || !DateTime.TryParse(toDateStr, out var toDate))
                {
                    throw new SEP490_BE.Exceptions.ArgumentException("Dữ liệu không hợp lệ.");
                }

                await _service.GetSchedulesByRoomId(roomId, fromDate, toDate);
            });

            Assert.AreEqual("Dữ liệu không hợp lệ.", ex.Message);
        }
    }
}
