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

namespace Test2.Services.ExaminationRoomsTest
{
    [TestFixture]
    public class GetExaminationRoomTests
    {
        private Mock<IExaminationRoomRepository> _roomRepositoryMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private ExaminationRoomService _service = null!;

        [SetUp]
        public void SetUp()
        {
            _roomRepositoryMock = new Mock<IExaminationRoomRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>(new DbContextOptions<KhanhAnNeurologyClinicContext>());
            _service = new ExaminationRoomService(_contextMock.Object, _roomRepositoryMock.Object);
        }

        [Test]
        public async Task GetById_ValidId_ReturnsRoomResponse()
        {
            var id = Guid.NewGuid().ToString();
            var room = new ExaminationRoom { Id = id, Name = "Phòng khám A", Description = "Mô tả A" };

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(room);

            var result = await _service.GetById(id);

            Assert.IsNotNull(result);
            Assert.AreEqual(room.Id, result.Id);
            Assert.AreEqual(room.Name, result.Name);
            Assert.AreEqual(room.Description, result.Description);
            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once());
        }

        [Test]
        public void GetById_NonExistentId_ThrowsResourceNotFoundException()
        {
            var id = Guid.NewGuid().ToString();

            _roomRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync((ExaminationRoom)null);

            var exception = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.GetById(id));
            Assert.That(exception.Message, Is.EqualTo("Không tìm thấy phòng khám lâm sàng."));
            _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once());
        }

        //[Test]
        //public void GetById_NullId_ThrowsArgumentNullException()
        //{
        //    string id = null;

        //    var exception = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.GetById(id));
        //    Assert.That(exception.Message, Contains.Substring("Không tìm thấy phòng khám lâm sàng."));
        //    _roomRepositoryMock.Verify(r => r.FindByIdAsync(It.IsAny<string>()), Times.Never());
        //}

        //[Test]
        //public void GetById_EmptyId_ThrowsArgumentException()
        //{
        //    var id = "";

        //    var exception = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.GetById(id));
        //    Assert.That(exception.Message, Contains.Substring("Không tìm thấy phòng khám lâm sàng."));
        //    _roomRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Never());
        //}
    }
}
