using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using SEP490_BE.DTO.MedicineDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Hubs;
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
    public class UpdateMedicineTests
    {
        private Mock<IMedicineRepository> _medicineRepositoryMock = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<DatabaseFacade> _databaseMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;
        private Mock<INotificationHubService> _notificationHubMock = null!;
        private MedicineService _service = null!;

        [SetUp]
        public void Setup()
        {
            _medicineRepositoryMock = new Mock<IMedicineRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>();
            _notificationHubMock = new Mock<INotificationHubService>();
            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();

            _databaseMock.Setup(db => db.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _service = new MedicineService(_contextMock.Object, _medicineRepositoryMock.Object, _notificationHubMock.Object);
        }

        [Test]
        public async Task UpdateMedicine_ValidDto_UpdatesSuccessfully()
        {
            var medicineId = "med-123";
            var medicine = new Medicine
            {
                Id = medicineId,
                Name = "OldName",
                Strength = "250mg",
                ActiveIngredients = "Old",
                Packaging = "Box",
                Unit = "Tablet"
            };

            var updateDto = new UpdateMedicineDTO
            {
                Name = "NewName",
                Strength = "500mg",
                ActiveIngredients = "New",
                Packaging = "New Box",
                Unit = "Capsule",
                Description = "Updated desc"
            };

            _medicineRepositoryMock.Setup(r => r.FindByIdAsync(medicineId)).ReturnsAsync(medicine);
            _medicineRepositoryMock.Setup(r => r.IsMedicineExistsAsync(updateDto.Name, updateDto.Strength)).ReturnsAsync(false);
            _medicineRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<Medicine>())).Returns(Task.CompletedTask);

            var result = await _service.UpdateMedicine(medicineId, updateDto);

            Assert.IsNotNull(result);
            Assert.AreEqual(updateDto.Name, result.Name);
            Assert.AreEqual(updateDto.Strength, result.Strength);
            _medicineRepositoryMock.Verify(r => r.FindByIdAsync(medicineId), Times.Once);
            _medicineRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Medicine>()), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            _transactionMock.Verify(t => t.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public void UpdateMedicine_WhenNotFound_ThrowsResourceNotFound()
        {
            var id = "not-exist";
            _medicineRepositoryMock.Setup(r => r.FindByIdAsync(id)).ReturnsAsync((Medicine?)null);

            var dto = new UpdateMedicineDTO { Name = "Updated" };

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.UpdateMedicine(id, dto));
            Assert.That(ex!.Message, Is.EqualTo("Thuốc không tồn tại."));
        }

       
        private IList<ValidationResult> ValidateModel(object model)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(model, null, null);
            Validator.TryValidateObject(model, context, results, true);
            return results;
        }
        [Test]
        public void UpdateMedicine_MissingName_ShouldFailValidation()
        {
            var dto = new UpdateMedicineDTO
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
        public void UpdateMedicine_NameTooLong_ShouldFailValidation()
        {
            var dto = new UpdateMedicineDTO
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
        public void UpdateMedicine_MissingRequiredFields_ShouldFailValidation()
        {
            var dto = new UpdateMedicineDTO
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
