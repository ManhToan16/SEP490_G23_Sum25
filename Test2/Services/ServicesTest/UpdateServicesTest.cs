using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.DTO.ServiceDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.ServiceRepositories;
using SEP490_BE.Services.ServiceServices;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.ServicesTest
{
    [TestFixture]
    public class ServiceServiceUpdateTests
    {
        private Mock<IServiceRepository> _serviceRepositoryMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DbSet<LaboratoryRoom>> _labRoomsMock = null!;
        private Mock<DatabaseFacade> _databaseMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;
        private ServiceService _service = null!;

        [SetUp]
        public void SetUp()
        {
            _serviceRepositoryMock = new Mock<IServiceRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>(new DbContextOptions<KhanhAnNeurologyClinicContext>());

            // Mock DbSet<LaboratoryRoom>
            var labRooms = new List<LaboratoryRoom>().AsQueryable();
            _labRoomsMock = new Mock<DbSet<LaboratoryRoom>>();
            _labRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.Provider).Returns(labRooms.Provider);
            _labRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.Expression).Returns(labRooms.Expression);
            _labRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.ElementType).Returns(labRooms.ElementType);
            _labRoomsMock.As<IQueryable<LaboratoryRoom>>().Setup(m => m.GetEnumerator()).Returns(labRooms.GetEnumerator());

            // Mock DatabaseFacade and transaction
            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();
            _databaseMock.Setup(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            _contextMock.Setup(c => c.LaboratoryRooms).Returns(_labRoomsMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _service = new ServiceService(_contextMock.Object, _serviceRepositoryMock.Object);
        }

        // TC001 - Valid input
        [Test]
        public async Task TC001_Update_ValidService_ReturnsUpdatedService()
        {
            var id = Guid.NewGuid().ToString();
            var existingService = new Service { Id = id, LaboratoryRoomsId = Guid.NewGuid().ToString(), Name = "Dịch vụ cũ", Price = 100, Description = "Mô tả cũ" };
            var request = new UpdateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = "Dịch vụ mới",
                Price = 150,
                Description = "Mô tả mới"
            };

            var labRoom = new LaboratoryRoom { Id = request.LaboratoryRoomId };

            _serviceRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingService);

            _labRoomsMock
                .Setup(m => m.FindAsync(request.LaboratoryRoomId))
                .ReturnsAsync(labRoom);

            _serviceRepositoryMock
                .Setup(r => r.ExistsByNameAsync(request.Name, request.LaboratoryRoomId))
                .ReturnsAsync(false);

            _serviceRepositoryMock
                .Setup(r => r.UpdateAsync(It.IsAny<Service>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Update(id, request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(request.Price, result.Price);
            Assert.AreEqual(request.Description, result.Description);
            Assert.AreEqual(request.LaboratoryRoomId, result.LaboratoryRoomId);
            Assert.AreEqual(id, result.Id);

            _serviceRepositoryMock.Verify(r => r.UpdateAsync(It.Is<Service>(
                s => s.Name == request.Name && s.Price == request.Price && s.Description == request.Description && s.LaboratoryRoomsId == request.LaboratoryRoomId)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        // TC002 - Service already exists
   


        // TC003 - Non-existent service
        [Test]
        public async Task TC003_Update_NonExistentService_ThrowsResourceNotFoundException()
        {
            var id = Guid.NewGuid().ToString();
            var request = new UpdateServiceDTO
            {
                Name = "Dịch vụ mới"
            };

            _serviceRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync((Service)null);

            var exception = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Update(id, request));
            Assert.That(exception.Message, Is.EqualTo("Không tìm thấy dịch vụ."));

            _serviceRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Service>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        // TC004 - Non-existent laboratory room
        [Test]
        public async Task TC004_Update_NonExistentLaboratoryRoom_ThrowsResourceNotFoundException()
        {
            var id = Guid.NewGuid().ToString();
            var existingService = new Service { Id = id, LaboratoryRoomsId = Guid.NewGuid().ToString(), Name = "Dịch vụ cũ", Price = 100, Description = "Mô tả cũ" };
            var request = new UpdateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = "Dịch vụ mới"
            };

            _serviceRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingService);

            _labRoomsMock
                .Setup(m => m.FindAsync(request.LaboratoryRoomId))
                .ReturnsAsync((LaboratoryRoom)null);

            var exception = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Update(id, request));
            Assert.That(exception.Message, Is.EqualTo("Không tìm thấy phòng xét nghiệm."));

            _serviceRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Service>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        // TC005 - Name with special character @
        [Test]
        public void TC005_Update_NameWithSpecialCharacterAt_FailsValidation()
        {
            var request = new UpdateServiceDTO
            {
                Name = "Dịch vụ mới@"
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Name") && r.ErrorMessage!.Contains("ký tự đặc biệt")));
        }

        // TC006 - Name with special character ®
        [Test]
        public void TC006_Update_NameWithSpecialCharacterRegistered_FailsValidation()
        {
            var request = new UpdateServiceDTO
            {
                Name = "Dịch vụ mới®"
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Name") && r.ErrorMessage!.Contains("ký tự đặc biệt")));
        }

        // TC007 - Uppercase name
        [Test]
        public async Task TC007_Update_DescriptionIsNull_ReturnsSuccess()
        {
            // Arrange
            var id = Guid.NewGuid().ToString();
            var existingService = new Service
            {
                Id = id,
                LaboratoryRoomsId = "123",
                Name = "Dịch vụ cũ",
                Description = "Mô tả cũ"
            };

            var request = new UpdateServiceDTO
            {
                Name = "Dịch vụ mới",
                Description = null
            };

            _serviceRepositoryMock.Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingService);

            _serviceRepositoryMock.Setup(r => r.ExistsByNameAsync(request.Name, existingService.LaboratoryRoomsId))
                .ReturnsAsync(false);

            _contextMock.Setup(c => c.LaboratoryRooms.FindAsync(It.IsAny<object[]>()))
      .ReturnsAsync(new LaboratoryRoom
      {
          Id = existingService.LaboratoryRoomsId,
          Name = "Phòng xét nghiệm 1"
      });


            _serviceRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<Service>()))
                .Returns(Task.CompletedTask);

            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            _databaseMock.Setup(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_transactionMock.Object);

            // Act
            var result = await _service.Update(id, request);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual("Mô tả cũ", result.Description);

        }



        // TC008 - Empty name
        [Test]
        public async Task TC008_Update_EmptyName_ReturnsSuccess()
        {
            var id = Guid.NewGuid().ToString();
            var existingService = new Service { Id = id, LaboratoryRoomsId = "6aa604f3-6162-45f5-b43a-e4653a28bbf4", Name = "Dịch vụ cũ", Price = 100, Description = "Mô tả cũ" };
            var request = new UpdateServiceDTO
            {
                Name = ""
            };

            _serviceRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingService);

            _serviceRepositoryMock
                .Setup(r => r.ExistsByNameAsync("", existingService.LaboratoryRoomsId))
                .ReturnsAsync(false);

            _serviceRepositoryMock
                .Setup(r => r.UpdateAsync(It.IsAny<Service>()))
                .Returns(Task.CompletedTask);
            var exception = Assert.ThrowsAsync<InvalidDataException>(() => _service.Update(id, request));
            Assert.That(exception.Message, Is.EqualTo("Tên dịch vụ không được để trống"));

            _serviceRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Service>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        // TC009 - Negative price
        [Test]
        public void TC009_Update_NegativePrice_FailsValidation()
        {
            var request = new UpdateServiceDTO
            {
                Price = -10
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Price")));
        }


    

        // TC008 - Empty name

        [Test]
        public async Task TC010_Update_PriceNull_ReturnsSuccess()
        {
            var id = Guid.NewGuid().ToString();
            var labRoomId = Guid.NewGuid().ToString();

            var existingService = new Service
            {
                Id = id,
                LaboratoryRoomsId = labRoomId,
                Name = "Dịch vụ cũ",
                Price = 100,
                Description = "Mô tả cũ"
            };

            var request = new UpdateServiceDTO
            {
                Price = null,
                Name = "Dịch vụ mới",
                Description = "Mô tả mới"
            };

            _serviceRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(existingService);

            _serviceRepositoryMock
                .Setup(r => r.ExistsByNameAsync(request.Name, labRoomId))
                .ReturnsAsync(false);

            _serviceRepositoryMock
                .Setup(r => r.UpdateAsync(It.IsAny<Service>()))
                .Returns(Task.CompletedTask);

            // 👉 Mock phòng xét nghiệm hợp lệ
            var labRoom = new LaboratoryRoom { Id = labRoomId, Name = "Phòng 1" };
            _labRoomsMock.Setup(x => x.FindAsync(It.IsAny<object[]>()))
                         .ReturnsAsync(labRoom);

            var result = await _service.Update(id, request);

            Assert.IsNotNull(result);
            Assert.AreEqual(existingService.Price, result.Price); // ✅ giữ nguyên giá
            Assert.AreEqual(request.Description, result.Description);
            Assert.AreEqual(request.Name, result.Name);

            _serviceRepositoryMock.Verify(r => r.UpdateAsync(It.Is<Service>(
                s => s.Price == existingService.Price &&
                     s.Name == request.Name &&
                     s.Description == request.Description
            )), Times.Once);

            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }


        // TC011 - Price xyz (invalid, test as large number)

        // TC011 - Price xyz (invalid, test as large number)
        [Test]
        public void TC011_Update_PriceInvalid_ReturnsFailValidation()
        {
            var request = new UpdateServiceDTO
            {
                Price = 1000000000m // Exceeds 999999999.99
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Price")));
        }

        // TC012 - Description over 200 chars
        [Test]
        public void TC012_Update_DescriptionOver200Chars_FailsValidation()
        {
            var request = new UpdateServiceDTO
            {
                Description = new string('D', 201)
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Description")));
        }

        // TC013 - LabId over 100
        [Test]
        public void TC013_Update_LaboratoryRoomIdOver100Chars_FailsValidation()
        {
            var request = new UpdateServiceDTO
            {
                LaboratoryRoomId = new string('L', 101)
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("LaboratoryRoomId")));
        }
    }
}
