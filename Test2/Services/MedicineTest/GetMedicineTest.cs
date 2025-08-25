using Moq;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Hubs;
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
    public class GetMedicineByIdTest
    {
        private Mock<IMedicineRepository> _medicineRepoMock = null!;
        private MedicineService _medicineService = null!;
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<INotificationHubService> _notificationHubMock = null!;

        [SetUp]
        public void Setup()
        {
            _medicineRepoMock = new Mock<IMedicineRepository>();
            _notificationHubMock= new Mock<INotificationHubService>();
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>();

            _medicineService = new MedicineService(
               
                _contextMock.Object, _medicineRepoMock.Object,_notificationHubMock.Object
            );
        }

        [Test]
        public async Task GetMedicineById_ValidId_ReturnsMedicine()
        {
            // Arrange
            var medicineId = "med001";
            var medicine = new Medicine
            {
                Id = medicineId,
                Name = "Paracetamol"
            };
            _medicineRepoMock.Setup(r => r.FindByIdAsync(medicineId)).ReturnsAsync(medicine);

            // Act
            var result = await _medicineService.GetMedicineById(medicineId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Id, Is.EqualTo(medicineId));
            Assert.That(result.Name, Is.EqualTo("Paracetamol"));
        }

        [Test]
        public void GetMedicineById_InvalidId_ThrowsResourceNotFoundException()
        {
            // Arrange
            var invalidId = "invalid123";
            _medicineRepoMock.Setup(r => r.FindByIdAsync(invalidId)).ReturnsAsync((Medicine?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(async () =>
                await _medicineService.GetMedicineById(invalidId));

            Assert.That(ex.Message, Is.EqualTo("Thuốc không tồn tại."));
        }
    }
}
