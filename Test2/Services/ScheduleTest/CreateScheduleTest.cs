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
    public class CreateScheduleTests
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
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public void CreateSchedule_EmptyUserId_ThrowsArgumentException()
        {
            var dto = new CreateScheduleDTO
            {
                UserId = null
            };

            var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(async () =>
                await _service.CreateSchedule(dto));

            Assert.That(ex.Message, Does.Contain("UserId được yêu cầu"));
        }

        [Test]
        public void CreateSchedule_UserNotFound_ThrowsNotFound()
        {
            var dto = new CreateScheduleDTO
            {
                UserId = "nonexistent",
                RoomId = "r1",
                TimeSlotId = "ts1",
                Date = DateTime.Today
            };

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () =>
                await _service.CreateSchedule(dto));

            Assert.That(ex.Message, Does.Contain("Không thấy người dùng"));
        }

        [Test]
        public async Task CreateSchedule_RoomNotFound_ThrowsNotFound()
        {
            var userId = "id12";
            var user = new User
            {
                Id = userId,
                Name = "Dr. Jane",
                Email = "jane@example.com",
                Gender = "Female",
                Password = "hashedPassword",
                PhoneNumber = "0123456789",
                UserRoles = new List<UserRole>
                {
                    new UserRole { RoleName = "DOCTOR" }
                }
            };
            
           
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var dto = new CreateScheduleDTO
            {
                UserId = userId,
                RoomId = "nonexistent",
                TimeSlotId = "ts1",
                Date = DateTime.Today
            };

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () =>
                await _service.CreateSchedule(dto));

            Assert.That(ex.Message, Does.Contain("Không tìm thấy phòng"));
        }

        [Test]
        public async Task CreateSchedule_NullTimeSlot_ThrowsArgumentException()
        {
            var userId = "id12";
            var user = new User
            {
                Id = userId,
                Name = "Dr. Jane",
                Email = "jane@example.com",
                Gender = "Female",
                Password = "hashedPassword",
                PhoneNumber = "0123456789",
                UserRoles = new List<UserRole>
                {
                    new UserRole { RoleName = "TECHNICIAN" }
                }
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var room = new LaboratoryRoom { Id = "lab1", Name = "Phòng Xét Nghiệm" };
            await _context.LaboratoryRooms.AddAsync(room);
            await _context.SaveChangesAsync();

            var dto = new CreateScheduleDTO
            {
                UserId = userId,
                RoomId = room.Id,
                TimeSlotId = "",
                Date = DateTime.Today
            };


            var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(async () =>
                await _service.CreateSchedule(dto));

            Assert.That(ex.Message, Does.Contain("TimeSlotId được yêu cầu"));
        }

        [Test]
        public async Task CreateSchedule_TimeSlotNotExist_ThrowsNotFound()
        {
            var userId = "id12";
            var user = new User
            {
                Id = userId,
                Name = "Dr. Jane",
                Email = "jane@example.com",
                Gender = "Female",
                Password = "hashedPassword",
                PhoneNumber = "0123456789",
                UserRoles = new List<UserRole>
                {
                    new UserRole { RoleName = "TECHNICIAN" }
                }
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var room = new LaboratoryRoom { Id = "lab2", Name = "Phòng Lab" };
            await _context.LaboratoryRooms.AddAsync(room);
            await _context.SaveChangesAsync();

            var dto = new CreateScheduleDTO
            {
                UserId = userId,
                RoomId = "lab2",
                TimeSlotId = "invalidTS",
                Date = DateTime.Today
            };

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () =>
                await _service.CreateSchedule(dto));

            Assert.That(ex.Message, Does.Contain("Không tìm thấy khoảng thời gian"));
        }

        //[Test]
        //public async Task CreateSchedule_ValidDoctorInExaminationRoom_ReturnsSchedule()
        //{
        //    var userId = "id12";
        //    var user = new User
        //    {
        //        Id = userId,
        //        Name = "Dr. Jane",
        //        Email = "jane@example.com",
        //        Gender = "Female",
        //        Password = "hashedPassword",
        //        PhoneNumber = "0123456789",


        //    };
        //    await _context.Users.AddAsync(user);

        //    var userRole = new UserRole
        //    {
        //        UserId = userId,
        //        RoleName = "DOCTOR"
        //    };

        //    await _context.UserRoles.AddAsync(userRole);
        //    await _context.SaveChangesAsync();

        //    var room = new ExaminationRoom { Id = "ex1", Name = "Phòng Khám 1" };
        //    var timeslot = new TimeSlot
        //    {
        //        Id = "TS001",
        //        Name = "Ca Sáng",
        //        StartTime = new TimeSpan(8, 0, 0),
        //        EndTime = new TimeSpan(12, 0, 0)
        //    };


        //    await _context.ExaminationRooms.AddAsync(room);
        //    await _context.TimeSlots.AddAsync(timeslot);
        //    await _context.SaveChangesAsync();

        //    _authServiceMock.Setup(a => a.GetAuthenticatedUser())
        //        .ReturnsAsync(new User { Id = "admin1", Name = "Admin" });

        //    var dto = new CreateScheduleDTO
        //    {
        //        UserId = userId,
        //        RoomId = room.Id,
        //        TimeSlotId = timeslot.Id,
        //        Date = DateTime.Today
        //    };

        //    var result = await _service.CreateSchedule(dto);

        //    Assert.That(result, Is.Not.Null);
        //    Assert.That(result.UserId, Is.EqualTo("id12"));
        //    Assert.That(result.Role, Is.EqualTo("DOCTOR"));
        //    Assert.That(result.RoomId, Is.EqualTo("ex1"));
        //    Assert.That(result.TimeSlotId, Is.EqualTo("TS001"));
        //}

        // Add more tests: conflict role, duplicate slot, lab limit, examination limit, etc...
        [Test]
        public async Task CreateSchedule_ConflictRole_ThrowsException()
        {
            var userId = "conflict1";
            await _context.Users.AddAsync(new User
            {
                Id = userId,
                Name = "Technician",
                Email = "tech@example.com",
                Gender = "Male",
                Password = "pass",
                PhoneNumber = "0123456789",
                UserRoles = new List<UserRole> { new UserRole { RoleName = "TECHNICIAN" } }
            });

            await _context.ExaminationRooms.AddAsync(new ExaminationRoom { Id = "room1", Name = "Phòng Khám A" });
            await _context.TimeSlots.AddAsync(new TimeSlot { Id = "TS001", Name = "Ca Sáng", StartTime = new(8, 0, 0), EndTime = new(12, 0, 0) });
            await _context.SaveChangesAsync();

            var dto = new CreateScheduleDTO
            {
                UserId = userId,
                RoomId = "room1",
                TimeSlotId = "TS001",
                Date = DateTime.Today
            };

            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await _service.CreateSchedule(dto));
            Assert.That(ex.Message, Does.Contain("Role TECHNICIAN không có quyền truy cập phòng EXAMINATION."));
        }
        [Test]
        public async Task CreateSchedule_DuplicateTimeSlot_ThrowsException()
        {
            var userId = "doctor1";
            await _context.Users.AddAsync(new User
            {
                Id = userId,
                Name = "Dr. A",
                Email = "dr@example.com",
                Gender = "Female",
                Password = "pass",
                PhoneNumber = "0987654321",
                UserRoles = new List<UserRole> { new UserRole { RoleName = "DOCTOR" } }
            });

            var room = new ExaminationRoom { Id = "ex1", Name = "Phòng Khám 1" };
            var timeslot = new TimeSlot { Id = "TS001", Name = "Ca Sáng", StartTime = new(8, 0, 0), EndTime = new(12, 0, 0) };
            await _context.ExaminationRooms.AddAsync(room);
            await _context.TimeSlots.AddAsync(timeslot);

            await _context.Schedules.AddAsync(new Schedule
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                RoomId = "ex1",
                TimeSlotId = "TS001",
                Date = DateTime.Today,
                Role = "DOCTOR",
                RoomType = "EXAMINATION"
            });

            await _context.SaveChangesAsync();

            var dto = new CreateScheduleDTO
            {
                UserId = userId,
                RoomId = "ex1",
                TimeSlotId = "TS001",
                Date = DateTime.Today
            };

            var ex = Assert.ThrowsAsync<ConflictDataException>(async () => await _service.CreateSchedule(dto));
            Assert.That(ex.Message, Does.Contain("Người dùng này đã có lịch làm việc cho khung giờ này vào ngày được chọn."));
        }
        //[Test]
        //public async Task CreateSchedule_LabRoomExceededLimit_ThrowsException()
        //{
        //    var userId = "lab1";
        //    await _context.Users.AddAsync(new User
        //    {
        //        Id = userId,
        //        Name = "Technician",
        //        Email = "lab@example.com",
        //        Gender = "Male",
        //        Password = "pass",
        //        PhoneNumber = "0000000000",
        //        UserRoles = new List<UserRole> { new UserRole { RoleName = "TECHNICIAN" } }
        //    });

        //    var labRoom = new LaboratoryRoom { Id = "lab1", Name = "Xét nghiệm máu" };
        //    var timeslot = new TimeSlot { Id = "TS001", Name = "Ca Sáng", StartTime = new(8, 0, 0), EndTime = new(12, 0, 0) };
        //    await _context.LaboratoryRooms.AddAsync(labRoom);
        //    await _context.TimeSlots.AddAsync(timeslot);

        //    for (int i = 0; i < 3; i++) // Giả sử giới hạn là 3
        //    {
        //        await _context.Schedules.AddAsync(new Schedule
        //        {
        //            Id = Guid.NewGuid().ToString(),
        //            UserId = $"tech{i}",
        //            RoomId = "lab1",
        //            TimeSlotId = "TS001",
        //            Date = DateTime.Today,
        //            Role = "TECHNICIAN",
        //            RoomType = "LABORATORY"
        //        });
        //    }

        //    await _context.SaveChangesAsync();

        //    var dto = new CreateScheduleDTO
        //    {
        //        UserId = userId,
        //        RoomId = "lab1",
        //        TimeSlotId = "TS001",
        //        Date = DateTime.Today
        //    };

        //    var ex = Assert.ThrowsAsync<ConflictDataException>(async () => await _service.CreateSchedule(dto));
        //    Assert.That(ex.Message, Does.Contain("Phòng xét nghiệm chỉ được phép có một KỸ THUẬT VIÊN và một Y TÁ cho mỗi khung giờ."));
        //}
        //[Test]
        //public async Task CreateSchedule_ExaminationRoomExceededLimit_ThrowsException()
        //{
        //    var userId = "doctorLimit";
        //    await _context.Users.AddAsync(new User
        //    {
        //        Id = userId,
        //        Name = "Dr. Limit",
        //        Email = "limit@example.com",
        //        Gender = "Male",
        //        Password = "pass",
        //        PhoneNumber = "1111111111",
        //        UserRoles = new List<UserRole> { new UserRole { RoleName = "DOCTOR" } }
        //    });

        //    var room = new ExaminationRoom { Id = "exLimit", Name = "Phòng khám 2" };
        //    var timeslot = new TimeSlot { Id = "TS001", Name = "Ca Sáng", StartTime = new(8, 0, 0), EndTime = new(12, 0, 0) };
        //    await _context.ExaminationRooms.AddAsync(room);
        //    await _context.TimeSlots.AddAsync(timeslot);

        //    for (int i = 0; i < 3; i++) 
        //    {
        //        await _context.Schedules.AddAsync(new Schedule
        //        {
        //            Id = Guid.NewGuid().ToString(),
        //            UserId = $"doc{i}",
        //            RoomId = "exLimit",
        //            TimeSlotId = "TS001",
        //            Date = DateTime.Today,
        //            Role = "DOCTOR",
        //            RoomType = "EXAMINATION"
        //        });
        //    }

        //    await _context.SaveChangesAsync();

        //    var dto = new CreateScheduleDTO
        //    {
        //        UserId = userId,
        //        RoomId = "exLimit",
        //        TimeSlotId = "TS001",
        //        Date = DateTime.Today
        //    };

        //    var ex = Assert.ThrowsAsync<ConflictDataException>(async () => await _service.CreateSchedule(dto));
        //    Assert.That(ex.Message, Does.Contain("đã đạt giới hạn cho phòng khám"));
        //}




    }
}
