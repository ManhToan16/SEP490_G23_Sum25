using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.DTO.SupplierDTO;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.SupplierRepositories;
using SEP490_BE.Services.SupplierServices;
using SEP490_BE.Exceptions;
using System.ComponentModel.DataAnnotations;

namespace Test2.Services.SupplierTest
{
    [TestFixture]
    public class UpdateServiceTest
    {
        private Mock<ISupplierRepository> _supplierRepositoryMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DatabaseFacade> _databaseMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;
        private SupplierService _service = null!;

        [SetUp]
        public void SetUp()
        {
            _supplierRepositoryMock = new Mock<ISupplierRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>(new DbContextOptions<KhanhAnNeurologyClinicContext>());

            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();

            _databaseMock.Setup(db => db.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            _service = new SupplierService(_contextMock.Object, _supplierRepositoryMock.Object);
        }

        [Test]
        public void UpdateSupplier_SupplierNotFound_ShouldThrowException()
        {
            string supplierId = "not_found_id";
            _supplierRepositoryMock.Setup(r => r.FindByIdAsync(supplierId))
                                   .ReturnsAsync((Supplier?)null);

            var dto = new UpdateSupplierDTO { Name = "Công ty ABC" };

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.UpdateSupplier(supplierId, dto));

            Assert.That(ex!.Message, Is.EqualTo("Nhà cung cấp không tồn tại."));
            _supplierRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Supplier>()), Times.Never);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        [Test]
        public async Task UpdateSupplier_ValidDto_UpdatesSuccessfully()
        {
            var supplierId = "id1";
            var existingSupplier = new Supplier
            {
                Id = supplierId,
                Name = "Old Name",
                PhoneNumber = "0123456789",
                Email = "old@mail.com"
            };

            var dto = new UpdateSupplierDTO
            {
                Name = "New Name",
                PhoneNumber = "0987654321",
                Email = "new@mail.com",
                Address = "New Address",
                Description = "New Desc"
            };

            _supplierRepositoryMock.Setup(r => r.FindByIdAsync(supplierId)).ReturnsAsync(existingSupplier);
            _supplierRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<Supplier>())).Returns(Task.CompletedTask);

            var result = await _service.UpdateSupplier(supplierId, dto);

            Assert.IsNotNull(result);
            Assert.That(result.Name, Is.EqualTo(dto.Name));
            Assert.That(result.Email, Is.EqualTo(dto.Email));

            _supplierRepositoryMock.Verify(r => r.UpdateAsync(It.Is<Supplier>(s => s.Id == supplierId)), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public void UpdateSupplier_WhenSaveFails_TransactionRollsBack()
        {
            var supplierId = "id-fail";
            var supplier = new Supplier
            {
                Id = supplierId,
                Name = "Fail Co",
                Email = "fail@email.com"
            };

            var dto = new UpdateSupplierDTO
            {
                Name = "Fail Co Updated"
            };

            _supplierRepositoryMock.Setup(r => r.FindByIdAsync(supplierId)).ReturnsAsync(supplier);
            _supplierRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<Supplier>())).Returns(Task.CompletedTask);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ThrowsAsync(new Exception("DB ERROR"));

            Assert.ThrowsAsync<Exception>(() => _service.UpdateSupplier(supplierId, dto));

            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Once);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        // -------------------- Validation ------------------------

        private List<ValidationResult> ValidateModel(object model)
        {
            var context = new ValidationContext(model, null, null);
            var results = new List<ValidationResult>();
            Validator.TryValidateObject(model, context, results, true);
            return results;
        }
        [Test]
        public void Name_IsRequired()
        {
            var dto = new UpdateSupplierDTO
            {
                Name = "",
                PhoneNumber = "0123456789"
            };

            var results = ValidateModel(dto);

            Assert.That(results.Any(r => r.ErrorMessage == "Tên nhà cung cấp là bắt buộc."), Is.True);
        }

        [Test]
        public void Name_TooLong_ShouldFailValidation()
        {
            var dto = new UpdateSupplierDTO
            {
                Name = new string('A', 101),
                PhoneNumber = "0123456789"
            };

            var results = ValidateModel(dto);
            Assert.That(results.Any(r => r.ErrorMessage == "Tên nhà cung cấp không được vượt quá 100 ký tự."), Is.True);
        }
        [Test]
        public void PhoneNumber_IsRequired()
        {
            var dto = new UpdateSupplierDTO
            {
                Name = "Công ty ABC",
                PhoneNumber = ""
            };

            var results = ValidateModel(dto);

            Assert.That(results.Any(r => r.ErrorMessage == "Số điện thoại là bắt buộc."), Is.True);
        }

        [Test]
        public void PhoneNumber_InvalidFormat()
        {
            var dto = new UpdateSupplierDTO
            {
                Name = "Valid",
                PhoneNumber = "123abc456"
            };

            var results = ValidateModel(dto);
            Assert.That(results.Any(r => r.ErrorMessage == "Số điện thoại không hợp lệ."), Is.True);
        }

        [Test]
        public void PhoneNumber_TooLong_ShouldFailValidation()
        {
            var dto = new UpdateSupplierDTO
            {
                PhoneNumber = "01234567890" // 11 ký tự
            };

            var results = ValidateModel(dto);
            Assert.That(results.Any(r => r.ErrorMessage == "Số điện thoại không được vượt quá 10 ký tự."), Is.True);
        }

        [Test]
        public void Email_InvalidFormat_ShouldFailValidation()
        {
            var dto = new UpdateSupplierDTO
            {
                Email = "invalidemail"
            };

            var results = ValidateModel(dto);
            Assert.That(results.Any(r => r.ErrorMessage == "Email không hợp lệ."), Is.True);
        }

        [Test]
        public void Email_TooLong_ShouldFailValidation()
        {
            var dto = new UpdateSupplierDTO
            {
                Email = new string('a', 95) + "@mail.com" // tổng > 100
            };

            var results = ValidateModel(dto);
            Assert.That(results.Any(r => r.ErrorMessage == "Email không được vượt quá 100 ký tự."), Is.True);
        }

        [Test]
        public void AllValid_ShouldPass()
        {
            var dto = new UpdateSupplierDTO
            {
                Name = "Công ty ABC",
                PhoneNumber = "0123456789",
                Email = "abc@mail.com",
                Address = "HCM",
                Description = "Mô tả"
            };

            var results = ValidateModel(dto);
            Assert.That(results, Is.Empty);
        }
        [Test]
        public async Task UpdateSupplier_WhenDuplicateNameOrEmail_ThrowsInvalidOperationException()
        {
            // Arrange
            var supplierId = "id1";
            var existingSupplier = new Supplier
            {
                Id = supplierId,
                Name = "Old Name",
                PhoneNumber = "0123456789",
                Email = "old@mail.com"
            };

            var dto = new UpdateSupplierDTO
            {
                Name = "New Name", // khác => sẽ kiểm tra trùng lặp
                PhoneNumber = "0987654321",
                Email = "new@mail.com",
                Address = "New Address",
                Description = "New Desc"
            };

            _supplierRepositoryMock
                .Setup(r => r.FindByIdAsync(supplierId))
                .ReturnsAsync(existingSupplier);

            _supplierRepositoryMock
                .Setup(r => r.IsSupplierExistsAsync(dto.Name, dto.Email))
                .ReturnsAsync(true);

            // Act + Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateSupplier(supplierId, dto));
            Assert.That(ex!.Message, Is.EqualTo("Nhà cung cấp đã tồn tại."));

            _supplierRepositoryMock.Verify(r => r.FindByIdAsync(supplierId), Times.Once);
            _supplierRepositoryMock.Verify(r => r.IsSupplierExistsAsync(dto.Name, dto.Email), Times.Once);
            _supplierRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Supplier>()), Times.Never);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        }


    }
}
