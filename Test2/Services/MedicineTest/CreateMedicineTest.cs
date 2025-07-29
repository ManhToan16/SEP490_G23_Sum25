using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using SEP490_BE.DTO.MedicineDTO;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.MedicineRepositories;
using SEP490_BE.Services.MedicineServices;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.MedicineTest
{
    [TestFixture]
    public class CreateMedicineTests
    {
        private Mock<IMedicineRepository> _medicineRepositoryMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DatabaseFacade> _databaseMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;
        private MedicineService _service = null!;

        [SetUp]
        public void Setup()
        {
            _medicineRepositoryMock = new Mock<IMedicineRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>();
            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();

            _databaseMock.Setup(db => db.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _service = new MedicineService(_contextMock.Object,_medicineRepositoryMock.Object);
        }

        private IList<ValidationResult> ValidateModel(object model)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(model, null, null);
            Validator.TryValidateObject(model, context, results, true);
            return results;
        }

        [Test]
        public async Task CreateMedicine_ValidDto_ReturnsResponseDto()
        {
            var dto = new CreateMedicineDTO
            {
                Name = "Paracetamol",
                ActiveIngredients = "Paracetamol",
                Strength = "500mg",
                Packaging = "Hộp 10 vỉ",
                Unit = "Viên",
                Description = "Thuốc giảm đau"
            };

            _medicineRepositoryMock.Setup(r => r.IsMedicineExistsAsync(dto.Name, dto.Strength)).ReturnsAsync(false);
            _medicineRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Medicine>())).Returns(Task.CompletedTask);
         

            var result = await _service.CreateMedicine(dto);

            Assert.IsNotNull(result);
            Assert.AreEqual(dto.Name, result.Name);
            Assert.AreEqual(dto.Strength, result.Strength);

            _medicineRepositoryMock.Verify(r => r.IsMedicineExistsAsync(dto.Name, dto.Strength), Times.Once);
            _medicineRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Medicine>()), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public void CreateMedicine_WhenExists_ThrowsInvalidOperationException()
        {
            var dto = new CreateMedicineDTO
            {
                Name = "Paracetamol",
                ActiveIngredients = "Paracetamol",
                Strength = "500mg",
                Packaging = "Hộp 10 vỉ",
                Unit = "Viên"
            };

            _medicineRepositoryMock.Setup(r => r.IsMedicineExistsAsync(dto.Name, dto.Strength)).ReturnsAsync(true);

            var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateMedicine(dto));
            Assert.That(ex!.Message, Is.EqualTo("Thuốc đã tồn tại trong hệ thống."));
            _medicineRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Medicine>()), Times.Never);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        [Test]
        public void CreateMedicine_MissingName_ShouldFailValidation()
        {
            var dto = new CreateMedicineDTO
            {
                Name = "",
                ActiveIngredients = "Paracetamol",
                Strength = "500mg",
                Packaging = "Hộp 10 vỉ",
                Unit = "Viên"
            };

            var result = ValidateModel(dto);
            Assert.That(result.Any(v => v.ErrorMessage == "Tên thuốc là bắt buộc."));
        }

        [Test]
        public void CreateMedicine_NameTooLong_ShouldFailValidation()
        {
            var dto = new CreateMedicineDTO
            {
                Name = new string('A', 201),
                ActiveIngredients = "Paracetamol",
                Strength = "500mg",
                Packaging = "Hộp 10 vỉ",
                Unit = "Viên"
            };

            var result = ValidateModel(dto);
            Assert.That(result.Any(v => v.ErrorMessage == "Tên thuốc không được vượt quá 200 ký tự."));
        }

        [Test]
        public void CreateMedicine_MissingRequiredFields_ShouldFailValidation()
        {
            var dto = new CreateMedicineDTO
            {
                Name = "Paracetamol",
                ActiveIngredients = "",
                Strength = "",
                Packaging = "Hộp 10 vỉ",
                Unit = ""
            };

            var result = ValidateModel(dto);

            Assert.That(result.Any(v => v.ErrorMessage == "Hoạt chất là bắt buộc."));
            Assert.That(result.Any(v => v.ErrorMessage == "Hàm lượng là bắt buộc."));
            Assert.That(result.Any(v => v.ErrorMessage == "Đơn vị là bắt buộc."));
        }
    }
}
