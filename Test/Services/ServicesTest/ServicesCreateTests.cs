using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using SEP490_BE.DTO.ServiceDTO;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.ServiceRepositories;
using SEP490_BE.Services.ServiceServices;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using Microsoft.EntityFrameworkCore.Infrastructure;
using SEP490_BE.Exceptions;

namespace Test.Services.Services
{
    [TestFixture]
    public class ServiceServiceCreateTests
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
        public async Task TC001_Create_ValidService_ReturnsCreatedService()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = "Siêu âm Doppler",
                Price = 50,
                Description = "Tiêu thụ siêu âm"
            };

            var labRoom = new LaboratoryRoom { Id = request.LaboratoryRoomId };

            _labRoomsMock
                .Setup(m => m.FindAsync(request.LaboratoryRoomId))
                .ReturnsAsync(labRoom);
            _serviceRepositoryMock
                .Setup(r => r.ExistsByNameAsync(request.Name, request.LaboratoryRoomId))
                .ReturnsAsync(false);

            _serviceRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<Service>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(request.Price, result.Price);
            Assert.AreEqual(request.Description, result.Description);
            Assert.AreEqual(request.LaboratoryRoomId, result.LaboratoryRoomId);
            Assert.IsNotNull(result.Id);

            _serviceRepositoryMock.Verify(r => r.InsertAsync(It.Is<Service>(
                s => s.Name == request.Name && s.Price == request.Price && s.Description == request.Description && s.LaboratoryRoomsId == request.LaboratoryRoomId)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        // TC002 - Service already exists
        [Test]
        public async Task TC002_Create_ServiceAlreadyExists_ThrowsInvalidOperationException()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = "Siêu âm Doppler",
                Price = 50,
                Description = "Tiêu thụ siêu âm"
            };

            var labRoom = new LaboratoryRoom { Id = request.LaboratoryRoomId };

            _labRoomsMock
               .Setup(m => m.FindAsync(request.LaboratoryRoomId))
               .ReturnsAsync(labRoom);

            _serviceRepositoryMock
                .Setup(r => r.ExistsByNameAsync(request.Name, request.LaboratoryRoomId))
                .ReturnsAsync(true);

            var exception = Assert.ThrowsAsync<InvalidOperationException>(() => _service.Create(request));
            Assert.That(exception.Message, Is.EqualTo("Dịch vụ đã tồn tại trong phòng xét nghiệm này."));

            _serviceRepositoryMock.Verify(r => r.InsertAsync(It.IsAny<Service>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        // TC003 - Non-existent laboratory room
        [Test]
        public async Task TC003_Create_NonExistentLaboratoryRoom_ThrowsResourceNotFoundException()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = "6aa604f3-6162-45f5-b43a-46653a8bb8f4",
                Name = "Siêu âm Doppler",
                Price = 50,
                Description = "Tiêu thụ siêu âm"
            };

            _labRoomsMock
     .Setup(m => m.FindAsync(request.LaboratoryRoomId))
     .ReturnsAsync((LaboratoryRoom?)null); 

            var exception = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Create(request));
            Assert.That(exception.Message, Is.EqualTo("Không tìm thấy phòng xét nghiệm."));

            _serviceRepositoryMock.Verify(r => r.InsertAsync(It.IsAny<Service>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        // TC004 - Name with special character @
        [Test]
        public void TC004_Create_NameWithSpecialCharacterAt_FailsValidation()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = "Siêu âm Doppler@",
                Price = 50,
                Description = "Tiêu thụ siêu âm"
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Name") && r.ErrorMessage!.Contains("ký tự đặc biệt")));
        }

        // TC005 - Name with special character ®
        [Test]
        public void TC005_Create_NameWithSpecialCharacterRegistered_FailsValidation()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = "Siêu âm Doppler®",
                Price = 50,
                Description = "Tiêu thụ siêu âm"
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Name") && r.ErrorMessage!.Contains("ký tự đặc biệt")));
        }

        // TC006 - Name uppercase
        [Test]
        public async Task TC006_Create_NameExceeds100Characters_ThrowsValidationException()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456", 
                Price = 50,
                Description = "Tiêu thụ siêu âm"
            };

            var labRoom = new LaboratoryRoom { Id = request.LaboratoryRoomId };

            _labRoomsMock
                .Setup(m => m.FindAsync(request.LaboratoryRoomId))
                .ReturnsAsync(labRoom);

            var exception = Assert.ThrowsAsync<ValidationException>(() => _service.Create(request));

            Assert.That(exception.Message, Does.Contain("Tên dịch vụ không được vượt quá 100 ký tự"));

            _serviceRepositoryMock.Verify(r => r.InsertAsync(It.IsAny<Service>()), Times.Never());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }


        // TC007 - Name null (empty)
        [Test]
        public void TC007_Create_EmptyName_FailsValidation()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = null,
                Price = 50,
                Description = "Tiêu thụ siêu âm"
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Name") && r.ErrorMessage!.Contains("bắt buộc")));
        }

        // TC008 - Negative price
        [Test]
        public void TC008_Create_NegativePrice_FailsValidation()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = "Siêu âm Doppler",
                Price = -10,
                Description = "Tiêu thụ siêu âm"
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Price")));
        }

        // TC009 - Price null
        [Test]
        public async Task TC009_Create_PriceNull_ReturnsSuccess()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = "Siêu âm Doppler",
                Price = null,
                Description = "Tiêu thụ siêu âm"
            };

            var labRoom = new LaboratoryRoom { Id = request.LaboratoryRoomId };

            _labRoomsMock
                .Setup(m => m.FindAsync(request.LaboratoryRoomId))
                .ReturnsAsync( labRoom );

            _serviceRepositoryMock
                .Setup(r => r.ExistsByNameAsync(request.Name, request.LaboratoryRoomId))
                .ReturnsAsync(false);

            _serviceRepositoryMock
                .Setup(r => r.InsertAsync(It.IsAny<Service>()))
                .Returns(Task.CompletedTask);

            var result = await _service.Create(request);

            Assert.IsNotNull(result);
            Assert.AreEqual(request.Name, result.Name);
            Assert.AreEqual(request.Price, result.Price);
            Assert.AreEqual(request.Description, result.Description);
            Assert.AreEqual(request.LaboratoryRoomId, result.LaboratoryRoomId);
            Assert.IsNotNull(result.Id);

            _serviceRepositoryMock.Verify(r => r.InsertAsync(It.Is<Service>(
                s => s.Name == request.Name && s.Price == request.Price && s.Description == request.Description && s.LaboratoryRoomsId == request.LaboratoryRoomId)), Times.Once());
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
            _databaseMock.Verify(d => d.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once());
            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never());
        }

        // TC010 - Price xyz (invalid, but since decimal, test as invalid input, use very large number)
        [Test]
        public void TC010_Create_PriceInvalid_ReturnsFailValidation()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = "Siêu âm Doppler",
                Price = 1000000000m, // Exceeds 999999999.99
                Description = "Tiêu thụ siêu âm"
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Price")));
        }

        // TC011 - Description over 200 chars
        [Test]
        public void TC011_Create_DescriptionOver200Chars_FailsValidation()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = Guid.NewGuid().ToString(),
                Name = "Siêu âm Doppler",
                Price = 50,
                Description = new string('D', 201)
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("Description")));
        }

        // TC012 - Unauthorized or LabId over 100
        [Test]
        public void TC012_Create_LaboratoryRoomIdOver100Chars_FailsValidation()
        {
            var request = new CreateServiceDTO
            {
                LaboratoryRoomId = new string('L', 101),
                Name = "Siêu âm Doppler",
                Price = 50,
                Description = "Tiêu thụ siêu âm"
            };

            var context = new ValidationContext(request, null, null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(request, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.MemberNames.Contains("LaboratoryRoomId")));
        }
    }
}