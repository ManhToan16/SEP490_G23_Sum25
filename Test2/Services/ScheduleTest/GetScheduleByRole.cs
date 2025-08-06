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
    public class GetScheduleByRole
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
        public void GetSchedulesByRole_InvalidRole_ThrowsResourceNotFoundException()
        {
            var invalidRole = "PATIENT";

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() =>
                _service.GetSchedulesByRole(invalidRole, null, null));

            Assert.That(ex.Message, Does.Contain("Vai trò không hợp lệ"));
        }

        [Test]
        public void GetSchedulesByRole_FromDateAfterToDate_ThrowsArgumentException()
        {
            var role = "DOCTOR";
            var fromDate = new DateTime(2025, 8, 1);
            var toDate = new DateTime(2025, 7, 1);

            var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(() =>
                _service.GetSchedulesByRole(role, fromDate, toDate));

            Assert.That(ex.Message, Is.EqualTo("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc."));
        }

        [Test]
        public async Task GetSchedulesByRole_ValidRequest_ReturnsSchedules()
        {
            // Arrange
            var role = "TECHNICIAN";
            var fromDate = new DateTime(2025, 7, 1);
            var toDate = new DateTime(2025, 7, 31);
            var roomId = "room456";
            await _context.ExaminationRooms.AddAsync(new ExaminationRoom
            {
                Id = roomId,
                Name = "Phòng Khám Tổng Quát",
                IsActive = true
            });
            await _context.SaveChangesAsync();
            var userId = "user123";
            var user = new User
            {
                Id = userId,
                Name = "Dr. Jane",
                Email = "jane@example.com",
                Gender = "Female",
                Password = "hashedPassword",
                PhoneNumber = "0123456789"
            };
            var schedules = new List<Schedule>
            {
                new Schedule
                {
                    Id = "s1",
                    UserId = "u1",
                    Role = "TECHNICIAN",
                    RoomId = roomId,
                    RoomType = "LAB",
                    Date = new DateTime(2025, 7, 15),
                    TimeSlotId = "ts1",
                    Status = "ACTIVE",
                    User = user
                }
            };

            _scheduleRepoMock.Setup(r => r.GetSchedulesByRoleAndDateRangeAsync(role, fromDate, toDate))
                             .ReturnsAsync(schedules);

            // Act
            var result = await _service.GetSchedulesByRole(role, fromDate, toDate);

            // Assert
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result[0].UserName, Is.EqualTo("Dr. Jane"));
            Assert.That(result[0].Role, Is.EqualTo("TECHNICIAN"));
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
        public void GetSchedulesByRole_InvalidDateFormat_ThrowsArgumentException(string fromDateStr, string toDateStr)
        {
            string role = "TECHNICIAN";

            var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(async () =>
            {
                if (!DateTime.TryParse(fromDateStr, out var fromDate) || !DateTime.TryParse(toDateStr, out var toDate))
                {
                    throw new SEP490_BE.Exceptions.ArgumentException("Dữ liệu không hợp lệ.");
                }

                await _service.GetSchedulesByRole(role, fromDate, toDate);
            });

            Assert.AreEqual("Dữ liệu không hợp lệ.", ex.Message);
        }
    }
}
