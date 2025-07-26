using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.ServiceRepositories;
using SEP490_BE.Services.ServiceServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SEP490_BE.Exceptions;

namespace Test.Services.ServicesTest
{
    [TestFixture]
    public class GetServiceTests
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
        [Test]
        public async Task GetById_ExistingId_ReturnsServiceResponseDTO()
        {
            // Arrange
            var serviceId = Guid.NewGuid().ToString();
            var service = new Service
            {
                Id = serviceId,
                LaboratoryRoomsId = "Lab123",
                Name = "Dịch vụ Xét nghiệm",
                Price = 150000,
                Description = "Mô tả dịch vụ"
            };

            _serviceRepositoryMock
                .Setup(r => r.FindByIdAsync(serviceId))
                .ReturnsAsync(service);

            // Act
            var result = await _service.GetById(serviceId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(service.Id, result.Id);
            Assert.AreEqual(service.LaboratoryRoomsId, result.LaboratoryRoomId);
            Assert.AreEqual(service.Name, result.Name);
            Assert.AreEqual(service.Price, result.Price);
            Assert.AreEqual(service.Description, result.Description);
        }
        [Test]
        public void GetById_NonExistentId_ThrowsResourceNotFoundException()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid().ToString();

            _serviceRepositoryMock
                .Setup(r => r.FindByIdAsync(nonExistentId))
                .ReturnsAsync((Service?)null);

            // Act + Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.GetById(nonExistentId));
            Assert.That(ex.Message, Is.EqualTo("Không tìm thấy dịch vụ."));
        }

    }
}
