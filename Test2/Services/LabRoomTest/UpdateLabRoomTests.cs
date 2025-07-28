using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.DTO.LaboratoryRoomDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.LaboratoryRoomRepositories;
using SEP490_BE.Services.LaboratoryRoomServices;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SEP490_BE.Services.ServiceServices;

namespace Test2.Services.LabRoomTest
{
    [TestFixture]
    public class UpdateLabRoomTests
    {
        private Mock<ILaboratoryRoomRepository> _roomRepositoryMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DbSet<LaboratoryRoom>> _LaboratoryRoomsMock = null!;
        private Mock<DatabaseFacade> _databaseMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;
        private LaboratoryRoomService _service = null!;
        private Mock<IServiceService> _serviceMock = null!;

        [SetUp]
        public void SetUp()
        {
            _roomRepositoryMock = new Mock<ILaboratoryRoomRepository>();
            _serviceMock = new Mock<IServiceService>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>(new DbContextOptions<KhanhAnNeurologyClinicContext>());

            // Mock DbSet<LaboratoryRoom>
            var rooms = new List<LaboratoryRoom>().AsQueryable();
            _LaboratoryRoomsMock = new Mock<DbSet<LaboratoryRoom>>();
            _LaboratoryRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.Provider).Returns(rooms.Provider);
            _LaboratoryRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.Expression).Returns(rooms.Expression);
            _LaboratoryRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.ElementType).Returns(rooms.ElementType);
            _LaboratoryRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.GetEnumerator()).Returns(rooms.GetEnumerator());

            // Mock DatabaseFacade and transaction
            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();
            _databaseMock.Setup(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            _contextMock.Setup(c => c.LaboratoryRooms).Returns(_LaboratoryRoomsMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _service = new LaboratoryRoomService(_contextMock.Object, _roomRepositoryMock.Object, _serviceMock.Object);
        }

        [Test]
        public async Task Update_ValidUpdate_ReturnsUpdatedRoom()
        {
            var id = Guid.NewGuid().ToString();
            var existingRoom = new LaboratoryRoom { Id = id, Name = "Phòng cũ", Description = "Mô tả cũ" };
            var request = new UpdateLaboratoryRoomDTO { Name = "Phòng mới", Description = "Mô tả mới" };

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingRoom);
            _roomRepositoryMock
                .Setup(r => r.UpdateAsync(It.IsAny<LaboratoryRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Update(id, request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(request.Description, result.Description);
            Assert.AreEqual(id, result.Id);

            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once());
            _roomRepositoryMock.Verify(r => r.UpdateAsync(It.Is<LaboratoryRoom>(
                room => room.Name == request.Name && room.Description == request.Description)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public async Task Update_PartialUpdateWithNullFields_ReturnsUpdatedRoom()
        {
            var id = Guid.NewGuid().ToString();
            var existingRoom = new LaboratoryRoom { Id = id, Name = "Phòng cũ", Description = "Mô tả cũ" };
            var request = new UpdateLaboratoryRoomDTO { Name = "Phòng mới", Description = null };

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingRoom);
            _roomRepositoryMock
                .Setup(r => r.UpdateAsync(It.IsAny<LaboratoryRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Update(id, request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(existingRoom.Description, result.Description); // Keeps original description
            Assert.AreEqual(id, result.Id);

            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once());
            _roomRepositoryMock.Verify(r => r.UpdateAsync(It.Is<LaboratoryRoom>(
                room => room.Name == request.Name && room.Description == existingRoom.Description)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public async Task Update_NameExactly100Chars_ReturnsSuccess()
        {
            var id = Guid.NewGuid().ToString();
            var existingRoom = new LaboratoryRoom { Id = id, Name = "Phòng cũ", Description = "Mô tả cũ" };
            var request = new UpdateLaboratoryRoomDTO { Name = new string('A', 100), Description = "Mô tả mới" };

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingRoom);
            _roomRepositoryMock
                .Setup(r => r.UpdateAsync(It.IsAny<LaboratoryRoom>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Update(id, request);

            Assert.IsNotNull(result);
            Assert.AreEqual(100, result.Name.Length);
            Assert.AreEqual(request.Description, result.Description);
            Assert.AreEqual(id, result.Id);

            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once());
            _roomRepositoryMock.Verify(r => r.UpdateAsync(It.Is<LaboratoryRoom>(
                room => room.Name == request.Name && room.Description == request.Description)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public void Update_NonExistentRoom_ThrowsResourceNotFoundException()
        {
            var id = Guid.NewGuid().ToString();
            var request = new UpdateLaboratoryRoomDTO { Name = "Phòng mới", Description = "Mô tả mới" };
            _roomRepositoryMock
            .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync((LaboratoryRoom)null);

            var exception = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Update(id, request));
            Assert.That(exception.Message, Is.EqualTo("Không tìm thấy phòng cận lâm sàng."));

            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once());
            _roomRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<LaboratoryRoom>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public void Update_NameWithSpecialCharacters_FailsValidation()
        {
            var id = Guid.NewGuid().ToString();
            var existingRoom = new LaboratoryRoom { Id = id, Name = "Phòng cũ", Description = "Mô tả cũ" };
            var request = new UpdateLaboratoryRoomDTO { Name = "Phòng mới@", Description = "Mô tả mới" };

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingRoom);

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Name")));
        }

        [Test]
        public void Update_NameOver100Chars_FailsValidation()
        {
            var id = Guid.NewGuid().ToString();
            var existingRoom = new LaboratoryRoom { Id = id, Name = "Phòng cũ", Description = "Mô tả cũ" };
            var request = new UpdateLaboratoryRoomDTO { Name = new string('A', 101), Description = "Mô tả mới" };

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingRoom);

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Name")));
        }

        [Test]
        public void Update_DescriptionOver200Chars_FailsValidation()
        {
            var id = Guid.NewGuid().ToString();
            var existingRoom = new LaboratoryRoom { Id = id, Name = "Phòng cũ", Description = "Mô tả cũ" };
            var request = new UpdateLaboratoryRoomDTO { Name = "Phòng mới", Description = new string('D', 201) };

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingRoom);

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Description")));
        }

        [Test]
        public async Task Update_UpdateAsyncFails_RollsBackTransaction()
        {
            var id = Guid.NewGuid().ToString();
            var existingRoom = new LaboratoryRoom { Id = id, Name = "Phòng cũ", Description = "Mô tả cũ" };
            var request = new UpdateLaboratoryRoomDTO { Name = "Phòng mới", Description = "Mô tả mới" };

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingRoom);

            _roomRepositoryMock
            .Setup(r => r.UpdateAsync(It.IsAny<LaboratoryRoom>()))
                .ThrowsAsync(new Exception("Database error"));

            Assert.ThrowsAsync<Exception>(async () => await _service.Update(id, request));

            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once());
            _roomRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<LaboratoryRoom>()), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Once());
        }
        [Test]
        public async Task Update_RoomNameAlreadyExists_ThrowsInvalidOperationException()
        {
            var id = Guid.NewGuid().ToString();
            var existingRoom = new LaboratoryRoom { Id = id, Name = "Phòng cũ", Description = "Mô tả cũ" };
            var request = new UpdateLaboratoryRoomDTO { Name = "Phòng đã tồn tại", Description = "Mô tả mới" };

            _roomRepositoryMock.Setup(r => r.FindByIdAsync(id)).ReturnsAsync(existingRoom);
            _roomRepositoryMock.Setup(r => r.ExistsByNameAsync(request.Name)).ReturnsAsync(true);

            var exception = Assert.ThrowsAsync<InvalidOperationException>(() => _service.Update(id, request));
            Assert.That(exception.Message, Is.EqualTo("Tên phòng đã tồn tại"));

            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once());
            _roomRepositoryMock.Verify(r => r.ExistsByNameAsync(request.Name), Times.Once());
            _roomRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<LaboratoryRoom>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }
    }
}
