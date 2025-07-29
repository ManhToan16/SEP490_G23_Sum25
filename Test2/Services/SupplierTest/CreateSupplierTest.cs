using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.DTO.SupplierDTO;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.SupplierRepositories;
using SEP490_BE.Services.SupplierServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Test2.Services.SupplierTest
{
    [TestFixture]
    public class CreateSupplierTests
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
        public void CreateSupplier_WhenExists_ThrowsInvalidOperationException()
        {
            var dto = new CreateSupplierDTO
            {
                Name = "ABC Co",
                Email = "abc@email.com"
            };

            _supplierRepositoryMock
                .Setup(r => r.IsSupplierExistsAsync(dto.Name, dto.Email))
                .ReturnsAsync(true);

            var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateSupplier(dto));
            Assert.That(ex!.Message, Is.EqualTo("Nhà cung cấp đã tồn tại."));

            _supplierRepositoryMock.Verify(r => r.IsSupplierExistsAsync(dto.Name, dto.Email), Times.Once);
            _supplierRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Supplier>()), Times.Never);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        [Test]
        public async Task CreateSupplier_ValidDto_CreatesSuccessfully()
        {
            var dto = new CreateSupplierDTO
            {
                Name = "XYZ Co",
                PhoneNumber = "0901234567",
                Email = "xyz@email.com",
                Address = "123 ABC St",
                Description = "Chuyên cung cấp vật tư"
            };

            _supplierRepositoryMock
                .Setup(r => r.IsSupplierExistsAsync(dto.Name, dto.Email))
                .ReturnsAsync(false);

            _supplierRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<Supplier>()))
                .Returns(Task.CompletedTask);

            var result = await _service.CreateSupplier(dto);

            Assert.IsNotNull(result);
            Assert.AreEqual(dto.Name, result.Name);
            Assert.AreEqual(dto.Email, result.Email);

            _supplierRepositoryMock.Verify(r => r.IsSupplierExistsAsync(dto.Name, dto.Email), Times.Once);
            _supplierRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Supplier>()), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public void CreateSupplier_WhenSaveFails_TransactionRollsBack()
        {
            var dto = new CreateSupplierDTO
            {
                Name = "Fail Co",
                Email = "fail@email.com"
            };

            _supplierRepositoryMock.Setup(r => r.IsSupplierExistsAsync(dto.Name, dto.Email)).ReturnsAsync(false);
            _supplierRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Supplier>())).Returns(Task.CompletedTask);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ThrowsAsync(new Exception("DB ERROR"));

            Assert.ThrowsAsync<Exception>(() => _service.CreateSupplier(dto));

            _transactionMock.Verify(t => t.RollbackAsync(It.IsAny<CancellationToken>()), Times.Once);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Never);
        }
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
            var dto = new CreateSupplierDTO
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
            var dto = new CreateSupplierDTO
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
            var dto = new CreateSupplierDTO
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
            var dto = new CreateSupplierDTO
            {
                Name = "Công ty ABC",
                PhoneNumber = "123abc456"
            };

            var results = ValidateModel(dto);

            Assert.That(results.Any(r => r.ErrorMessage == "Số điện thoại không hợp lệ."), Is.True);
        }

        [Test]
        public void PhoneNumber_TooLong_ShouldFailValidation()
        {
            var dto = new CreateSupplierDTO
            {
                Name = "Công ty ABC",
                PhoneNumber = "01234567890" // 11 ký tự
            };

            var results = ValidateModel(dto);

            Assert.That(results.Any(r => r.ErrorMessage == "Số điện thoại không được vượt quá 10 ký tự."), Is.True);
        }

        [Test]
        public void Email_InvalidFormat_ShouldFailValidation()
        {
            var dto = new CreateSupplierDTO
            {
                Name = "Công ty ABC",
                PhoneNumber = "0123456789",
                Email = "invalidemail"
            };

            var results = ValidateModel(dto);

            Assert.That(results.Any(r => r.ErrorMessage == "Email không hợp lệ."), Is.True);
        }

        [Test]
        public void Email_TooLong_ShouldFailValidation()
        {
            var dto = new CreateSupplierDTO
            {
                Name = "Công ty ABC",
                PhoneNumber = "0123456789",
                Email = new string('a', 95) + "@mail.com" // tổng > 100
            };

            var results = ValidateModel(dto);

            Assert.That(results.Any(r => r.ErrorMessage == "Email không được vượt quá 100 ký tự."), Is.True);
        }

        [Test]
        public void AllValid_ShouldPass()
        {
            var dto = new CreateSupplierDTO
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
    }
}
