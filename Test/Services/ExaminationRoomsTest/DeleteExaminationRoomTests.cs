using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.ExaminationRoomRepositories;
using SEP490_BE.Services.ExaminationRoomServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test.Services.ExaminationRoomsTest
{
    [TestFixture]
    public class DeleteExaminationRoomTests
    {
        private Mock<IExaminationRoomRepository> _roomRepositoryMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private ExaminationRoomService _service = null!;

        [SetUp]
        public void SetUp()
        {
            _roomRepositoryMock = new Mock<IExaminationRoomRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>(new DbContextOptions<KhanhAnNeurologyClinicContext>());
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
            _service = new ExaminationRoomService(_contextMock.Object, _roomRepositoryMock.Object);
        }

        [Test]
        public async Task Delete_ValidId_DeletesRoomSuccessfully()
        {
            var id = Guid.NewGuid().ToString();
            var room = new ExaminationRoom { Id = id, Name = "Phòng khám A", Description = "Mô tả A" };

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(room);

            _roomRepositoryMock
                .Setup(r => r.DeleteAsync(room))
                .Returns(Task.CompletedTask);

            await _service.Delete(id);

            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once());
            _roomRepositoryMock.Verify(r => r.DeleteAsync(room), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
        }

        [Test]
        public void Delete_NonExistentId_ThrowsResourceNotFoundException()
        {
            var id = Guid.NewGuid().ToString();

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync((ExaminationRoom)null);

            var exception = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Delete(id));
            Assert.That(exception.Message, Is.EqualTo("Không tìm thấy phòng khám lâm sàng."));

            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once());
            _roomRepositoryMock.Verify(r => r.DeleteAsync(It.IsAny<ExaminationRoom>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public void Delete_NullId_ThrowsArgumentNullException()
        {
            string id = null;

            var exception = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Delete(id));
            Assert.That(exception.Message, Is.EqualTo("Không tìm thấy phòng khám lâm sàng."));

            _roomRepositoryMock.Verify(r => r.FindByIdAsync(It.IsAny<string>()), Times.Never());
            _roomRepositoryMock.Verify(r => r.DeleteAsync(It.IsAny<ExaminationRoom>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public void Delete_EmptyId_ThrowsArgumentException()
        {
            var id = "";

            var exception = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Delete(id));
            Assert.That(exception.Message, Is.EqualTo("Không tìm thấy phòng khám lâm sàng."));

            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Never());
            _roomRepositoryMock.Verify(r => r.DeleteAsync(It.IsAny<ExaminationRoom>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        [Test]
        public async Task Delete_DeleteAsyncFails_ThrowsException()
        {
            var id = Guid.NewGuid().ToString();
            var room = new ExaminationRoom { Id = id, Name = "Phòng khám A", Description = "Mô tả A" };

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(room);

            _roomRepositoryMock
                .Setup(r => r.DeleteAsync(room))
                .ThrowsAsync(new ResourceNotFoundException("Database error"));

             Assert.ThrowsAsync<ResourceNotFoundException>(async () => await _service.Delete(id));

            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once());
            _roomRepositoryMock.Verify(r => r.DeleteAsync(room), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
        }
    }
}
