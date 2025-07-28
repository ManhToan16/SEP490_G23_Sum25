using Microsoft.EntityFrameworkCore.Infrastructure;
using Moq;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.MedicineRepositories;
using SEP490_BE.Services.MedicineServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.MedicineTest
{
    [TestFixture]
    public class DeleteMedicineTest
    {
        private Mock<IMedicineRepository> _medicineRepoMock = null!;
        private MedicineService _medicineService = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;

        [SetUp]
        public void Setup()
        {
            _medicineRepoMock = new Mock<IMedicineRepository>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>();

            var dbMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _contextMock.Setup(c => c.Database).Returns(dbMock.Object);

            _medicineService = new MedicineService(
                
                _contextMock.Object, _medicineRepoMock.Object
            );
        }

        [Test]
        public async Task DeleteMedicine_MedicineExists_DeletesSuccessfully()
        {
            // Arrange
            var medicineId = "med123";
            var medicine = new Medicine { Id = medicineId };
            _medicineRepoMock.Setup(r => r.FindByIdAsync(medicineId)).ReturnsAsync(medicine);

            // Act
            await _medicineService.DeleteMedicine(medicineId);

            // Assert
            _medicineRepoMock.Verify(r => r.DeleteAsync(medicine), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public void DeleteMedicine_MedicineNotFound_ThrowsException()
        {
            // Arrange
            var medicineId = "invalid123";
            _medicineRepoMock.Setup(r => r.FindByIdAsync(medicineId)).ReturnsAsync((Medicine?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () =>
                await _medicineService.DeleteMedicine(medicineId));

            Assert.That(ex.Message, Is.EqualTo("Thuốc không tồn tại."));
        }
    }
}
