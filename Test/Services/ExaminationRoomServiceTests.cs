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
using System.Text;
using System.Threading.Tasks;

namespace Test.Services
{
    [TestFixture]
    public class ExaminationRoomServiceTests
    {
        private Mock<IExaminationRoomRepository> _roomRepositoryMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private ExaminationRoomService _service = null!;

        [SetUp]
        public void SetUp()
        {
            _roomRepositoryMock = new Mock<IExaminationRoomRepository>();

            var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _contextMock = new Mock<KhanhAnNeurologyClinicContext>(options);
            _service = new ExaminationRoomService(_contextMock.Object, _roomRepositoryMock.Object);
        }

        // TC001 - Valid input
        [Test]
        public async Task TC001_Create_ValidRoom_ReturnsCreatedRoom()
        {
            var request = new CreateExaminationRoomDTO
            {
                Name = "Phòng khám đa khoa",
                Description = "Phòng chuyên khám nội thần kinh"
            };

            _roomRepositoryMock.Setup(r => r.InsertAsync(It.IsAny<ExaminationRoom>())).Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
        }

        // TC002 - Valid name + Description = 200 chars (Boundary)
        [Test]
        public async Task TC002_Create_DescriptionExactly200Chars_ReturnsSuccess()
        {
            var request = new CreateExaminationRoomDTO
            {
                Name = "Phòng khám đa khoa 1",
                Description = new string('A', 200)
            };

            _roomRepositoryMock.Setup(r => r.InsertAsync(It.IsAny<ExaminationRoom>())).Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(200, result.Description.Length);
        }

        // TC003 - Name contains special character (Abnormal)
        [Test]
        public void TC003_Create_NameWithSpecialCharacter_FailsValidation()
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
            Assert.That(results.Any(r => r.ErrorMessage!.Contains("ký tự đặc biệt")));
        }

        // TC004 - Name is uppercase only (Normal)
        [Test]
        public async Task TC004_Create_UppercaseName_ReturnsSuccess()
        {
            var request = new CreateExaminationRoomDTO
            {
                Name = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                Description = "Phòng khám chuyên khoa nội"
            };

            _roomRepositoryMock.Setup(r => r.InsertAsync(It.IsAny<ExaminationRoom>())).Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
        }

        // TC005 - Empty name (Abnormal)
        [Test]
        public void TC005_Create_EmptyName_FailsValidation()
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
            Assert.That(results.Any(r => r.ErrorMessage!.Contains("Tên phòng là bắt buộc")));
        }

        // TC006 - Name > 100 chars (Abnormal)
        [Test]
        public void TC006_Create_NameOver100Chars_FailsValidation()
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
            Assert.That(results.Any(r => r.ErrorMessage!.Contains("100 ký tự")));
        }

        // TC007 - Description > 200 chars (Abnormal)
        [Test]
        public void TC007_Create_DescriptionOver200Chars_FailsValidation()
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
            Assert.That(results.Any(r => r.ErrorMessage!.Contains("200 ký tự")));
        }

        // TC008 - Room already exists (Abnormal)
        [Test]
        public void TC008_Create_RoomAlreadyExists_ThrowsException()
        {
            var request = new CreateExaminationRoomDTO
            {
                Name = "Phòng khám đa khoa",
                Description = "Phòng khám cũ"
            };

            var serviceMock = new Mock<ExaminationRoomService>(_contextMock.Object, _roomRepositoryMock.Object);
            serviceMock.Setup(s => s.IsExaminationRoomExistsAsync("Phòng khám đa khoa"))
                .ReturnsAsync(true);

            Assert.ThrowsAsync<InvalidOperationException>(() => serviceMock.Object.Create(request));
        }
    }
}
