using Moq;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.SupplierRepositories;
using SEP490_BE.Services.SupplierServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.SupplierTest
{
    [TestFixture]
    public class DeleteSupplierTests
    {
        private Mock<ISupplierRepository> _supplierRepositoryMock;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock;
        private SupplierService _service;

        [SetUp]
        public void SetUp()
        {
            _supplierRepositoryMock = new Mock<ISupplierRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>();
            _service = new SupplierService(_contextMock.Object, _supplierRepositoryMock.Object);
        }

        [Test]
        public async Task DeleteSupplier_WhenExists_DeletesSuccessfully()
        {
            // Arrange
            var supplierId = "id1";
            var supplier = new Supplier { Id = supplierId };

            _supplierRepositoryMock.Setup(r => r.FindByIdAsync(supplierId))
                .ReturnsAsync(supplier);

            _supplierRepositoryMock.Setup(r => r.DeleteAsync(supplier))
                .Returns(Task.CompletedTask);

            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            // Act
            await _service.DeleteSupplier(supplierId);

            // Assert
            _supplierRepositoryMock.Verify(r => r.DeleteAsync(supplier), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public void DeleteSupplier_WhenNotExists_ThrowsResourceNotFoundException()
        {
            // Arrange
            var supplierId = "not-exist";
            _supplierRepositoryMock.Setup(r => r.FindByIdAsync(supplierId))
                .ReturnsAsync((Supplier?)null);

            // Act + Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.DeleteSupplier(supplierId));
            Assert.That(ex!.Message, Is.EqualTo("Không tìm thấy nhà cung cấp."));
        }
    }
}
