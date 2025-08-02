using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
    using NUnit.Framework;
    using Moq;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using SEP490_BE.Constants;
    using SEP490_BE.DTO.PrescriptionDTO;
    using SEP490_BE.Entities;
    using SEP490_BE.Exceptions;
    using SEP490_BE.Repositories.ExaminationResultRepositories;
    using SEP490_BE.Repositories.PrescriptionRepositories;
    using SEP490_BE.Services.PrescriptionServices;

namespace Test2.Services.PrescriptionTest
{


    [TestFixture]
    public class PrescriptionServiceTest
    {
        private Mock<IPrescriptionRepository> _prescriptionRepoMock;
        private Mock<IExaminationResultRepository> _examRepoMock;
        private KhanhAnNeurologyClinicContext _context;
        private PrescriptionService _service;

        [SetUp]
        public void Setup()
        {
            _prescriptionRepoMock = new Mock<IPrescriptionRepository>();
            _examRepoMock = new Mock<IExaminationResultRepository>();

            var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new KhanhAnNeurologyClinicContext(options);

            _service = new PrescriptionService(_prescriptionRepoMock.Object, _examRepoMock.Object, _context);
        }

        [Test]
        public async Task CreateAsync_ShouldCreateSuccessfully()
        {
            // Arrange
            var examId = "exam1";
            var visit = new Visit { Id = "visit1", Status = VisitStatus.RETURNING };
            var exam = new ExaminationResult { Id = examId, Visit = visit };

            _examRepoMock.Setup(x => x.FindByIdAsync(examId)).ReturnsAsync(exam);

            var med1 = new Medicine
            {
                Id = "med1",
                Name = "Paracetamol",
                Unit = "viên",
                Strength = "500mg",
                Packaging = "Hộp 10 vỉ x 10 viên",
                ActiveIngredients = "Paracetamol"
            };

            var med2 = new Medicine
            {
                Id = "med2",
                Name = "Amoxicillin",
                Unit = "viên",
                Strength = "500mg",
                Packaging = "Hộp 2 vỉ x 10 viên",
                ActiveIngredients = "Amoxicillin"
            };

            _context.Medicines.AddRange(med1, med2);
            await _context.SaveChangesAsync();

            var request = new PrescriptionRequestDTO
            {
                Note = "Ghi chú",
                Items = new List<PrescriptionItemRequestDTO>
            {
                new() { MedicineId = "med1", Dosage = "1v", Frequency = "2l", Duration = "5n", Instructions = "sau ăn" },
                new() { MedicineId = "med2", Dosage = "1v", Frequency = "3l", Duration = "7n", Instructions = "trước ăn" }
            }
            };

            // Act
            var result = await _service.CreateAsync(examId, request);

            // Assert
            Assert.NotNull(result);
            Assert.AreEqual(examId, result.ExaminationResultId);
            Assert.AreEqual(2, result.Items.Count);
            _prescriptionRepoMock.Verify(x => x.AddAsync(It.IsAny<Prescription>()), Times.Once);
        }

        [Test]
        public void CreateAsync_ShouldThrow_WhenExaminationResultNotFound()
        {
            _examRepoMock.Setup(x => x.FindByIdAsync(It.IsAny<string>())).ReturnsAsync((ExaminationResult)null!);

            var request = new PrescriptionRequestDTO { Items = new List<PrescriptionItemRequestDTO>() };

            var ex = Assert.ThrowsAsync<Exception>(() => _service.CreateAsync("invalid-id", request));
            Assert.That(ex!.Message, Is.EqualTo(MessageConstants.EXAMINATION_RESULT_NOT_FOUND));
        }

        [Test]
        public void CreateAsync_ShouldThrow_WhenVisitIsCompleted()
        {
            var exam = new ExaminationResult
            {
                Id = "exam-id",
                Visit = new Visit { Id = "visit-id", Status = VisitStatus.COMPLETED }
            };

            _examRepoMock.Setup(x => x.FindByIdAsync(It.IsAny<string>())).ReturnsAsync(exam);

            var request = new PrescriptionRequestDTO { Items = new List<PrescriptionItemRequestDTO>() };

            var ex = Assert.ThrowsAsync<Exception>(() => _service.CreateAsync("exam-id", request));
            Assert.That(ex!.Message, Is.EqualTo(MessageConstants.PRESCRIPTION_INVALID_UPDATE));
        }

        [Test]
        public async Task CreateAsync_ShouldThrow_WhenMedicineNotExist()
        {
            var exam = new ExaminationResult
            {
                Id = "exam-id",
                Visit = new Visit { Id = "visit-id", Status = VisitStatus.RETURNING }
            };

            _examRepoMock.Setup(x => x.FindByIdAsync("exam-id")).ReturnsAsync(exam);

            var request = new PrescriptionRequestDTO
            {
                Items = new List<PrescriptionItemRequestDTO>
            {
                new() { MedicineId = "invalid-id", Dosage = "", Frequency = "", Duration = "", Instructions = "" }
            }
            };

            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.CreateAsync("exam-id", request));
            Assert.That(ex!.Message, Is.EqualTo("Thuốc không tồn tại"));
        }

        [Test]
        public async Task GetByExaminationResultIdAsync_ShouldReturnPrescription()
        {
            var examId = "exam-id";
            var prescription = new Prescription
            {
                Id = "pres-1",
                ExaminationResultId = examId,
                Note = "Test",
                CreatedAt = DateTime.Now,
                PrescriptionItems = new List<PrescriptionItem>()
            };

            _prescriptionRepoMock.Setup(x => x.FindByExaminationResultIdAsync(examId))
                .ReturnsAsync(prescription);

            var result = await _service.GetByExaminationResultIdAsync(examId);

            Assert.NotNull(result);
            Assert.AreEqual(prescription.Id, result!.Id);
        }

        [Test]
        public async Task GetByExaminationResultIdAsync_ShouldReturnNull_WhenNotFound()
        {
            _prescriptionRepoMock.Setup(x => x.FindByExaminationResultIdAsync(It.IsAny<string>()))
                .ReturnsAsync((Prescription)null!);

            var result = await _service.GetByExaminationResultIdAsync("invalid-id");

            Assert.IsNull(result);
        }
    }

}
