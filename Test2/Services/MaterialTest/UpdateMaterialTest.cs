using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using SEP490_BE.DTO.MaterialDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.MaterialRepositories;
using SEP490_BE.Services.MaterialServices;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.MaterialTest
{
    [TestFixture]
    public class UpdateMaterialTests
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
        public async Task UpdateMaterial_ValidRequest_ReturnsUpdatedMaterial()
        {
            var material = new Material
            {
                Id = "mat-001",
                Name = "OldName",
                CategoryId = "cat-001",
                SupplierId = "sup-001",
                Unit = "Box",
                QuantityInStock = 50,
                MinQuantity = 10,
                MaxQuantity = 100
            };

            var dto = new UpdateMaterialDTO
            {
                Name = "NewName",
                CategoryId = "cat-002",
                SupplierId = "sup-002",
                Unit = "Kg",
                QuantityInStock = 70,
                MinQuantity = 20,
                MaxQuantity = 80
            };

            _materialRepositoryMock.Setup(r => r.FindByIdAsync(material.Id)).ReturnsAsync(material);
            _contextMock.Setup(c => c.Categories.FindAsync(dto.CategoryId)).ReturnsAsync(new Category { Id = dto.CategoryId });
            _contextMock.Setup(c => c.Suppliers.FindAsync(dto.SupplierId)).ReturnsAsync(new Supplier { Id = dto.SupplierId });
            _materialRepositoryMock.Setup(r => r.IsMaterialExistsAsync(dto.Name, dto.CategoryId, dto.SupplierId)).ReturnsAsync(false);

            var context = new ValidationContext(dto);
            Validator.ValidateObject(dto, context, validateAllProperties: true);

            var result = await _service.UpdateMaterial(material.Id, dto);

            Assert.IsNotNull(result);
            Assert.AreEqual(dto.Name, result.Name);
            Assert.AreEqual(dto.QuantityInStock, result.QuantityInStock);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public void UpdateMaterial_MinGreaterThanMax_ThrowsInvalidOperation()
        {
            var material = new Material { Id = "mat-002" };

            var dto = new UpdateMaterialDTO
            {
                Name = "Vật tư A", // bắt buộc
                CategoryId = "valid-category-id", // cũng nên có nếu bạn validate
                SupplierId = "valid-supplier-id",
                Unit = "Hộp",
                QuantityInStock = 10,
                MinQuantity = 15,
                MaxQuantity = 10
            };


            _materialRepositoryMock.Setup(r => r.FindByIdAsync(material.Id)).ReturnsAsync(material);
            _contextMock.Setup(c => c.Categories.FindAsync(dto.CategoryId)).ReturnsAsync(new Category { Id = dto.CategoryId });
            _contextMock.Setup(c => c.Suppliers.FindAsync(dto.SupplierId)).ReturnsAsync((Supplier?)null);
            var context = new ValidationContext(dto);
            Validator.ValidateObject(dto, context, validateAllProperties: true);

            var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateMaterial(material.Id, dto));
            Assert.That(ex!.Message, Is.EqualTo("Số lượng tối thiểu không được lớn hơn số lượng tối đa."));
        }

        [Test]
        public void UpdateMaterial_NotFound_ThrowsResourceNotFound()
        {
            var dto = new UpdateMaterialDTO { Name = "Gloves" };

            _materialRepositoryMock.Setup(r => r.FindByIdAsync("notfound")).ReturnsAsync((Material?)null);

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.UpdateMaterial("notfound", dto));
            Assert.That(ex!.Message, Is.EqualTo("Vật tư không tồn tại."));
        }

        [Test]
        public void UpdateMaterial_DuplicateMaterial_ThrowsInvalidOperation()
        {
            var material = new Material { Id = "mat-003" };
            var dto = new UpdateMaterialDTO
            {
                Name = "Gauze",
                CategoryId = "cat-001",
                SupplierId = "sup-001",
                Unit = "Box"
            };

            _materialRepositoryMock.Setup(r => r.FindByIdAsync(material.Id)).ReturnsAsync(material);
            _contextMock.Setup(c => c.Categories.FindAsync(dto.CategoryId)).ReturnsAsync(new Category { Id = dto.CategoryId });
            _contextMock.Setup(c => c.Suppliers.FindAsync(dto.SupplierId)).ReturnsAsync(new Supplier { Id = dto.SupplierId });
            _materialRepositoryMock.Setup(r => r.IsMaterialExistsAsync(dto.Name, dto.CategoryId, dto.SupplierId)).ReturnsAsync(true);

            var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateMaterial(material.Id, dto));
            Assert.That(ex!.Message, Is.EqualTo("Vật tư đã tồn tại."));
        }

        [Test]
        public void UpdateMaterial_CategoryNotFound_ThrowsResourceNotFound()
        {
            var material = new Material { Id = "mat-004" };
            var dto = new UpdateMaterialDTO
            {
                Name = "Gloves",
                CategoryId = "cat-notfound",
                SupplierId = "sup-001"
            };

            _materialRepositoryMock.Setup(r => r.FindByIdAsync(material.Id)).ReturnsAsync(material);
            _contextMock.Setup(c => c.Categories.FindAsync(dto.CategoryId)).ReturnsAsync((Category?)null);

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.UpdateMaterial(material.Id, dto));
            Assert.That(ex!.Message, Is.EqualTo("Danh mục không tồn tại."));
        }

        [Test]
        public void UpdateMaterial_SupplierNotFound_ThrowsResourceNotFound()
        {
            var material = new Material { Id = "mat-005" };
            var dto = new UpdateMaterialDTO
            {
                Name = "Gloves",
                CategoryId = "cat-001",
                SupplierId = "sup-notfound"
            };

            _materialRepositoryMock.Setup(r => r.FindByIdAsync(material.Id)).ReturnsAsync(material);
            _contextMock.Setup(c => c.Categories.FindAsync(dto.CategoryId)).ReturnsAsync(new Category { Id = dto.CategoryId });
            _contextMock.Setup(c => c.Suppliers.FindAsync(dto.SupplierId)).ReturnsAsync((Supplier?)null);

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.UpdateMaterial(material.Id, dto));
            Assert.That(ex!.Message, Is.EqualTo("Nhà cung cấp không tồn tại."));
        }

        [Test]
        public void UpdateMaterial_DataAnnotations_InvalidName_ShouldFailValidation()
        {
            var dto = new UpdateMaterialDTO { Name = new string('A', 256) };
            var context = new ValidationContext(dto);
            var results = new List<ValidationResult>();

            var isValid = Validator.TryValidateObject(dto, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.ErrorMessage!.Contains("Tên vật tư không được vượt quá 255 ký tự.")));
        }

        [Test]
        public void UpdateMaterial_DataAnnotations_MissingRequiredFields_ShouldFailValidation()
        {
            var dto = new UpdateMaterialDTO();
            var context = new ValidationContext(dto);
            var results = new List<ValidationResult>();

            var isValid = Validator.TryValidateObject(dto, context, results, true);

            Assert.IsFalse(isValid);
            Assert.That(results.Count, Is.GreaterThan(0));
        }

        [Test]
        public void UpdateMaterial_DataAnnotations_InvalidRange_ShouldFailValidation()
        {
            var dto = new UpdateMaterialDTO
            {
                Name = "Needle",
                CategoryId = "cat",
                SupplierId = "sup",
                Unit = "Box",
                QuantityInStock = -1,
                MinQuantity = -10,
                MaxQuantity = 0
            };
            var context = new ValidationContext(dto);
            var results = new List<ValidationResult>();

            var isValid = Validator.TryValidateObject(dto, context, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.ErrorMessage!.Contains("Số lượng tồn kho phải >= 0.")));
            Assert.IsTrue(results.Any(r => r.ErrorMessage!.Contains("Số lượng tối thiểu phải >= 0.")));
            Assert.IsTrue(results.Any(r => r.ErrorMessage!.Contains("Số lượng tối đa phải >= 1.")));
        }
    }
}
