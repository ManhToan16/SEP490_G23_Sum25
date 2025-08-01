using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490_BE.Constants;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.MedicalRecordRepositories;
using SEP490_BE.Repositories.PatientProfileRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.PatientProfileServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test2.Services.PatientProfileTest
{
    [TestFixture]
    public class GetPatientProfileTest
    {
        private Mock<IPatientProfileRepository> _patientRepoMock = null!;
        private PatientProfileService _service = null!;

        [SetUp]
        public void SetUp()
        {
            _patientRepoMock = new Mock<IPatientProfileRepository>();
            var dummyMedicalRecordRepo = new Mock<IMedicalRecordRepository>();
            var dummyAuditRepo = new Mock<IAuditLogRepository>();
            var dummyAuthService = new Mock<IAuthService>();
            var dummyContext = new Mock<KhanhAnNeurologyClinicContext>(new DbContextOptions<KhanhAnNeurologyClinicContext>());

            _service = new PatientProfileService(
                dummyContext.Object,
                _patientRepoMock.Object,
                dummyMedicalRecordRepo.Object,
                dummyAuthService.Object,
                dummyAuditRepo.Object
            );
        }

        [Test]
        public async Task GetAll_ShouldReturnPagedResult_WhenCalledWithFilters()
        {
            // Arrange
            var mockData = new List<PatientProfile>
        {
            new PatientProfile
            {
                Id = "p1",
                Name = "Nguyễn Văn A",
                CitizenId = "123456789",
                PhoneNumber = "0123456789",
                Email = "a@gmail.com",
                DateOfBirth = new DateTime(1990, 1, 1),
                Gender = "Nam",
                Address = "HN"
            },
            new PatientProfile
            {
                Id = "p2",
                Name = "Trần Thị B",
                CitizenId = "987654321",
                PhoneNumber = "0987654321",
                Email = "b@gmail.com",
                DateOfBirth = new DateTime(1992, 2, 2),
                Gender = "Nữ",
                Address = "HCM"
            }
        };

            _patientRepoMock.Setup(r => r.FindAll(
                    It.IsAny<string>(),
                    It.IsAny<DateTime?>(),
                    It.IsAny<string>(),
                    1,
                    10
                ))
                .ReturnsAsync((mockData, mockData.Count));

            // Act
            var result = await _service.GetAll(null, null, null, 1, 10);

            // Assert
            Assert.AreEqual(2, result.Items.Count);
            Assert.AreEqual(1, result.PageNumber);
            Assert.AreEqual(10, result.PageSize);
            Assert.AreEqual(2, result.TotalItems);
            Assert.AreEqual("Nguyễn Văn A", result.Items[0].Name);
        }

        [Test]
        public async Task GetById_ShouldReturnPatientProfile_WhenExists()
        {
            // Arrange
            var patient = new PatientProfile
            {
                Id = "abc123",
                Name = "Lê Văn C",
                CitizenId = "000111222",
                PhoneNumber = "0111222333",
                Email = "c@gmail.com",
                DateOfBirth = new DateTime(1985, 3, 3),
                Gender = "Nam",
                Address = "Huế"
            };

            _patientRepoMock.Setup(r => r.FindById("abc123")).ReturnsAsync(patient);

            // Act
            var result = await _service.GetById("abc123");

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("Lê Văn C", result.Name);
            Assert.AreEqual("000111222", result.CitizenId);
            Assert.AreEqual("Huế", result.Address);
        }

        [Test]
        public void GetById_ShouldThrow_WhenNotFound()
        {
            // Arrange
            _patientRepoMock.Setup(r => r.FindById("notfound")).ReturnsAsync((PatientProfile?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.GetById("notfound"));
            Assert.That(ex!.Message, Is.EqualTo(MessageConstants.PATIENT_PROTILE_NOT_FOUND));
        }
    }

}
