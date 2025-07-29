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
    public class GetSupplierByIdTests
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
        public async Task GetSupplierById_WhenExists_ReturnsSupplierResponse()
        {
            // Arrange
            var supplierId = "id1";
            var supplier = new Supplier
            {
                Id = supplierId,
                Name = "Nhà thuốc ABC",
                PhoneNumber = "0123456789",
                Email = "abc@mail.com",
                Address = "Hà Nội",
                Description = "Nhà cung cấp thuốc"
            };

            _supplierRepositoryMock.Setup(r => r.FindByIdAsync(supplierId))
                .ReturnsAsync(supplier);

            // Act
            var result = await _service.GetSupplierById(supplierId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Id, Is.EqualTo(supplier.Id));
            Assert.That(result.Name, Is.EqualTo(supplier.Name));
        }

        [Test]
        public void GetSupplierById_WhenNotExists_ThrowsResourceNotFoundException()
        {
            // Arrange
            var supplierId = "not-found";
            _supplierRepositoryMock.Setup(r => r.FindByIdAsync(supplierId))
                .ReturnsAsync((Supplier?)null);

            // Act + Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.GetSupplierById(supplierId));
            Assert.That(ex!.Message, Is.EqualTo("Nhà cung cấp không tồn tại."));
        }
    }
}
