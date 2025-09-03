using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.DTO.LaboratoryRoomDTO;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.LaboratoryRoomRepositories;
using SEP490_BE.Services.LaboratoryRoomServices;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SEP490_BE.Repositories.LaboratoryRoomRepositories;
using SEP490_BE.Services.ServiceServices;
using SEP490_BE.Repositories.ScheduleRepositories;

namespace Test2.Services.LabRoomTest
{
    [TestFixture]
    public class CreateLabRoomTests
    {
        private Mock<ILaboratoryRoomRepository> _roomRepositoryMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DbSet<LaboratoryRoom>> _labRoomsMock = null!;
        private Mock<DatabaseFacade> _databaseMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;
        private LaboratoryRoomService _service = null!;
        private Mock<IServiceService> _serviceServiceMock = null!;
        private Mock<IScheduleRepository> _scheduleRepo = null!;


        [SetUp]
        public void SetUp()
        {
            _roomRepositoryMock = new Mock<ILaboratoryRoomRepository>();
            _serviceServiceMock = new Mock<IServiceService>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>(new DbContextOptions<KhanhAnNeurologyClinicContext>());
            _scheduleRepo= new Mock<IScheduleRepository>();

            // Mock DbSet<LaboratoryRoom>
            var rooms = new List<LaboratoryRoom>().AsQueryable();
            _labRoomsMock = new Mock<DbSet<LaboratoryRoom>>();
            _labRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.Provider).Returns(rooms.Provider);
            _labRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.Expression).Returns(rooms.Expression);
            _labRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.ElementType).Returns(rooms.ElementType);
            _labRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.GetEnumerator()).Returns(rooms.GetEnumerator());

            // Mock DatabaseFacade and transaction
            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();
            _databaseMock.Setup(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            _contextMock.Setup(c => c.LaboratoryRooms).Returns(_labRoomsMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _service = new LaboratoryRoomService(_contextMock.Object, _roomRepositoryMock.Object,_serviceServiceMock.Object,_scheduleRepo.Object);
        }

        [Test]
        public async Task Create_ValidRoom_ReturnsCreatedRoom()
        {
            var request = new CreateLaboratoryRoomDTO
            {
                Name = "Phòng khám đa khoa",
                Description = "Phòng chuyên khám nội thần kinh"
            };

            _roomRepositoryMock
                .Setup(r => r.ExistsByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            _roomRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<LaboratoryRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(request.Description, result.Description);
            Assert.IsNotNull(result.Id);

            _roomRepositoryMock.Verify(r => r.InsertAsync(It.Is<LaboratoryRoom>(
                room => room.Name == request.Name && room.Description == request.Description)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public async Task Create_DescriptionExactly200Chars_ReturnsSuccess()
        {
            var request = new CreateLaboratoryRoomDTO
            {
                Name = "Phòng khám đa khoa 1",
                Description = new string('A', 200)
            };

            _roomRepositoryMock
                .Setup(r => r.ExistsByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            _roomRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<LaboratoryRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(200, result.Description.Length);
            Assert.IsNotNull(result.Id);

            _roomRepositoryMock.Verify(r => r.InsertAsync(It.Is<LaboratoryRoom>(
                room => room.Name == request.Name && room.Description == request.Description)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public void Create_NameWithSpecialCharacters_FailsValidation()
        {
            var request = new CreateLaboratoryRoomDTO
            {
                Name = "Phòng khám đa khoa@",
                Description = "Phòng 1e"
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Name")));
        }

        [Test]
        public async Task Create_UppercaseName_ReturnsSuccess()
        {
            var request = new CreateLaboratoryRoomDTO
            {
                Name = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
                Description = "Phòng khám chuyên khoa nội"
            };

            _roomRepositoryMock
                .Setup(r => r.ExistsByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            _roomRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<LaboratoryRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(request.Description, result.Description);
            Assert.IsNotNull(result.Id);

            _roomRepositoryMock.Verify(r => r.InsertAsync(It.Is<LaboratoryRoom>(
                room => room.Name == request.Name && room.Description == request.Description)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public void Create_EmptyName_FailsValidation()
        {
            var request = new CreateLaboratoryRoomDTO
            {
                Name = "",
                Description = "Phòng 1e"
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Name")));
        }

        [Test]
        public void Create_NameOver100Chars_FailsValidation()
        {
            var request = new CreateLaboratoryRoomDTO
            {
                Name = new string('A', 101),
                Description = "Phòng 1e"
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Name")));
        }

        [Test]
        public void Create_DescriptionOver200Chars_FailsValidation()
        {
            var request = new CreateLaboratoryRoomDTO
            {
                Name = "Phòng khám 1",
                Description = new string('D', 201)
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Description")));
        }

        [Test]
        public async Task Create_RoomAlreadyExists_ThrowsException()
        {
            var request = new CreateLaboratoryRoomDTO
            {
                Name = "Phòng khám đa khoa",
                Description = "Phòng khám cũ"
            };

            _roomRepositoryMock
                .Setup(r => r.ExistsByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(true);

            var exception = Assert.ThrowsAsync<InvalidOperationException>(() => _service.Create(request));
            Assert.That(exception.Message, Is.EqualTo("Tên phòng đã tồn tại"));

            _roomRepositoryMock.Verify(r => r.ExistsByNameAsync(It.IsAny<string>()), Times.Once());
            _roomRepositoryMock.Verify(r => r.InsertAsync(It.IsAny<LaboratoryRoom>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public async Task Create_NameExactly100Chars_ReturnsSuccess()
        {
            var request = new CreateLaboratoryRoomDTO
            {
                Name = new string('A', 100),
                Description = "Phòng khám hợp lệ"
            };

            _roomRepositoryMock
                .Setup(r => r.ExistsByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            _roomRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<LaboratoryRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(100, result.Name.Length);
            Assert.AreEqual(request.Description, result.Description);
            Assert.IsNotNull(result.Id);

            _roomRepositoryMock.Verify(r => r.InsertAsync(It.Is<LaboratoryRoom>(
                room => room.Name == request.Name && room.Description == request.Description)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public async Task Create_NullDescription_ReturnsSuccess()
        {
            var request = new CreateLaboratoryRoomDTO
            {
                Name = "Phòng khám đa khoa",
                Description = null
            };

            _roomRepositoryMock
                .Setup(r => r.ExistsByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            _roomRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<LaboratoryRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.IsNull(result.Description);
            Assert.AreEqual(request.Name, result.Name);
            Assert.IsNotNull(result.Id);

            _roomRepositoryMock.Verify(r => r.InsertAsync(It.Is<LaboratoryRoom>(
                room => room.Name == request.Name && room.Description == null)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }
    }
}
