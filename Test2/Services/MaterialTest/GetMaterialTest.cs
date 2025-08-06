using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.MaterialRepositories;
using SEP490_BE.Services.MaterialServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.MaterialTest
{
    [TestFixture]
    public class GetMaterialTest
    {
        private Mock<IMaterialRepository> _materialRepositoryMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DatabaseFacade> _databaseMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;
        private MaterialService _service = null!;

        [SetUp]
        public void Setup()
        {
            _materialRepositoryMock = new Mock<IMaterialRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>();
            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();

            _databaseMock.Setup(db => db.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            _service = new MaterialService(_contextMock.Object, _materialRepositoryMock.Object);
        }
        [Test]
        public async Task GetmaterialById_ValidId_Returnsmaterial()
        {
            // Arrange
            var materialId = "mat001";
            var material = new Material
            {
                Id = materialId,
                Name = "Khẩu trang y tế"
            };
            _materialRepositoryMock.Setup(r => r.FindByIdAsync(materialId)).ReturnsAsync(material);

            // Act
            var result = await _service.GetMaterialById(materialId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Id, Is.EqualTo(materialId));
            Assert.That(result.Name, Is.EqualTo("Khẩu trang y tế"));
        }

        [Test]
        public void GetmaterialById_InvalidId_ThrowsResourceNotFoundException()
        {
            // Arrange
            var invalidId = "invalid123";
            _materialRepositoryMock.Setup(r => r.FindByIdAsync(invalidId)).ReturnsAsync((Material?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () =>
                await _service.GetMaterialById(invalidId));

            Assert.That(ex.Message, Is.EqualTo("Vật tư không tồn tại."));
        }

    }
}
