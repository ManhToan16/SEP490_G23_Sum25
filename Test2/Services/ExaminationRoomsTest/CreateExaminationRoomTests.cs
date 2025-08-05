using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.DTO.ExaminationRoomDTO;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.ExaminationRoomRepositories;
using SEP490_BE.Services.ExaminationRoomServices;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using NUnit.Framework;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using SEP490_BE.Repositories.ScheduleRepositories;
using SEP490_BE.Repositories.TransactionRepositories;
using SEP490_BE.Repositories.RoleRepositories;
namespace Test2.Services.ExaminationRooms
{
    [TestFixture]
    public class CreateExaminationRoomTests
    {
        private Mock<IExaminationRoomRepository> _roomRepositoryMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DbSet<ExaminationRoom>> _examinationRoomsMock = null!;
        private Mock<DatabaseFacade> _databaseMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;
        private ExaminationRoomService _service = null!;
        private Mock<IScheduleRepository> _scheduleRepositoryMock = null!;
        private Mock<ITransactionRepository> _transactionRepositoryMock = null!;
        private Mock<IRoleRepository> _roleRepositoryMock = null!;

        [SetUp]
        public void SetUp()
        {
            _roomRepositoryMock = new Mock<IExaminationRoomRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>(new DbContextOptions<KhanhAnNeurologyClinicContext>());
            _scheduleRepositoryMock = new Mock<IScheduleRepository>();
            _transactionRepositoryMock = new Mock<ITransactionRepository>();
            _roleRepositoryMock = new Mock<IRoleRepository>();


            // Mock DbSet<ExaminationRoom>
            var rooms = new List<ExaminationRoom>().AsQueryable();
            _examinationRoomsMock = new Mock<DbSet<ExaminationRoom>>();
            _examinationRoomsMock.As<IQueryable<ExaminationRoom>>().Setup(m => m.Provider).Returns(rooms.Provider);
            _examinationRoomsMock.As<IQueryable<ExaminationRoom>>().Setup(m => m.Expression).Returns(rooms.Expression);
            _examinationRoomsMock.As<IQueryable<ExaminationRoom>>().Setup(m => m.ElementType).Returns(rooms.ElementType);
            _examinationRoomsMock.As<IQueryable<ExaminationRoom>>().Setup(m => m.GetEnumerator()).Returns(rooms.GetEnumerator());

            // Mock DatabaseFacade and transaction
            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();
            _databaseMock.Setup(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            _contextMock.Setup(c => c.ExaminationRooms).Returns(_examinationRoomsMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _service = new ExaminationRoomService(_contextMock.Object, _roomRepositoryMock.Object,_scheduleRepositoryMock.Object,_transactionRepositoryMock.Object, _roleRepositoryMock.Object);
        }

        [Test]
        public async Task Create_ValidRoom_ReturnsCreatedRoom()
        {
            var request = new CreateExaminationRoomDTO
            {
                Name = "Phòng khám đa khoa",
                Description = "Phòng chuyên khám nội thần kinh"
            };

            _roomRepositoryMock
                .Setup(r => r.ExistsByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            _roomRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<ExaminationRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(request.Description, result.Description);
            Assert.IsNotNull(result.Id);

            _roomRepositoryMock.Verify(r => r.InsertAsync(It.Is<ExaminationRoom>(
                room => room.Name == request.Name && room.Description == request.Description)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public async Task Create_DescriptionExactly200Chars_ReturnsSuccess()
        {
            var request = new CreateExaminationRoomDTO
            {
                Name = "Phòng khám đa khoa 1",
                Description = new string('A', 200)
            };

            _roomRepositoryMock
                .Setup(r => r.ExistsByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            _roomRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<ExaminationRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(200, result.Description.Length);
            Assert.IsNotNull(result.Id);

            _roomRepositoryMock.Verify(r => r.InsertAsync(It.Is<ExaminationRoom>(
                room => room.Name == request.Name && room.Description == request.Description)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public void Create_NameWithSpecialCharacters_FailsValidation()
        {
            var request = new CreateExaminationRoomDTO
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
            var request = new CreateExaminationRoomDTO
            {
                Name = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
                Description = "Phòng khám chuyên khoa nội"
            };

            _roomRepositoryMock
                .Setup(r => r.ExistsByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            _roomRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<ExaminationRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(request.Description, result.Description);
            Assert.IsNotNull(result.Id);

            _roomRepositoryMock.Verify(r => r.InsertAsync(It.Is<ExaminationRoom>(
                room => room.Name == request.Name && room.Description == request.Description)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public void Create_EmptyName_FailsValidation()
        {
            var request = new CreateExaminationRoomDTO
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
            var request = new CreateExaminationRoomDTO
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
            var request = new CreateExaminationRoomDTO
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
            var request = new CreateExaminationRoomDTO
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
            _roomRepositoryMock.Verify(r => r.InsertAsync(It.IsAny<ExaminationRoom>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public async Task Create_NameExactly100Chars_ReturnsSuccess()
        {
            var request = new CreateExaminationRoomDTO
            {
                Name = new string('A', 100),
                Description = "Phòng khám hợp lệ"
            };

            _roomRepositoryMock
                .Setup(r => r.ExistsByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            _roomRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<ExaminationRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(100, result.Name.Length);
            Assert.AreEqual(request.Description, result.Description);
            Assert.IsNotNull(result.Id);

            _roomRepositoryMock.Verify(r => r.InsertAsync(It.Is<ExaminationRoom>(
                room => room.Name == request.Name && room.Description == request.Description)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public async Task Create_NullDescription_ReturnsSuccess()
        {
            var request = new CreateExaminationRoomDTO
            {
                Name = "Phòng khám đa khoa",
                Description = null
            };

            _roomRepositoryMock
                .Setup(r => r.ExistsByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            _roomRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<ExaminationRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.IsNull(result.Description);
            Assert.AreEqual(request.Name, result.Name);
            Assert.IsNotNull(result.Id);

            _roomRepositoryMock.Verify(r => r.InsertAsync(It.Is<ExaminationRoom>(
                room => room.Name == request.Name && room.Description == null)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }
        private static Mock<DbSet<T>> CreateMockDbSet<T>(List<T> data) where T : class
        {
            var queryable = data.AsQueryable();
            var mockSet = new Mock<DbSet<T>>();
            mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
            mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
            mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());
            return mockSet;
        }

    }

}