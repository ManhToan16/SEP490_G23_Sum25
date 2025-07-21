using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO.PrescriptionDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.ExaminationResultRepositories;
using SEP490_BE.Repositories.PrescriptionRepositories;

namespace SEP490_BE.Services.PrescriptionServices
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly IPrescriptionRepository _repository;
        private readonly IExaminationResultRepository _examRepo;
        private readonly KhanhAnNeurologyClinicContext _context;

        public PrescriptionService(
            IPrescriptionRepository repository, 
            IExaminationResultRepository examRepo,
            KhanhAnNeurologyClinicContext context
            )
        {
            _repository = repository;
            _examRepo = examRepo;
            _context = context;
        }

        public async Task<PrescriptionResponseDTO> CreateAsync(string examinationResultId, PrescriptionRequestDTO request)
        {
            var examResult = await _examRepo.FindByIdAsync(examinationResultId)
                 ?? throw new Exception(MessageConstants.EXAMINATION_RESULT_NOT_FOUND);

            if (examResult.Visit.Status == VisitStatus.COMPLETED)
                throw new Exception(MessageConstants.PRESCRIPTION_INVALID_UPDATE);

            var requestedMedicineIds = request.Items.Select(i => i.MedicineId).ToList();

            var existingMedicineIds = await _context.Medicines
                .Where(m => requestedMedicineIds.Contains(m.Id))
                .Select(m => m.Id)
                .ToListAsync();

            var invalidIds = requestedMedicineIds.Except(existingMedicineIds).ToList();
            if (invalidIds.Any())
            {
                throw new ResourceNotFoundException($"Thuốc không tồn tại");
            }

            var prescription = new Prescription
            {
                Id = Guid.NewGuid().ToString(),
                ExaminationResultId = examinationResultId,
                Note = request.Note,
                CreatedAt = DateTime.Now,
                PrescriptionItems = request.Items.Select(item => new PrescriptionItem
                {
                    Id = Guid.NewGuid().ToString(),
                    MedicineId = item.MedicineId,
                    Dosage = item.Dosage,
                    Frequency = item.Frequency,
                    Duration = item.Duration,
                    Instructions = item.Instructions
                }).ToList()
            };

            await _repository.AddAsync(prescription);
            await _context.SaveChangesAsync();

            return ToResponseDTO(prescription);
        }

        public async Task<PrescriptionResponseDTO?> GetByExaminationResultIdAsync(string examinationResultId)
        {
            var prescription = await _repository.FindByExaminationResultIdAsync(examinationResultId);
            return prescription != null ? ToResponseDTO(prescription) : null;
        }

        public async Task<PrescriptionResponseDTO> UpdateAsync(string id, PrescriptionRequestDTO request)
        {
            var prescription = await _repository.FindByIdAsync(id)
                              ?? throw new Exception(MessageConstants.PRESCRIPTION_NOT_FOUND);

            var examResult = await _examRepo.FindByIdAsync(prescription.ExaminationResultId)
                             ?? throw new Exception(MessageConstants.EXAMINATION_RESULT_NOT_FOUND);

            if (examResult.Visit.Status == VisitStatus.COMPLETED)
                throw new Exception(MessageConstants.PRESCRIPTION_INVALID_UPDATE);

            prescription.Note = request.Note;

            var requestedMedicineIds = request.Items.Select(i => i.MedicineId).ToList();
            var existingMedicineIds = await _context.Medicines
                .Where(m => requestedMedicineIds.Contains(m.Id))
                .Select(m => m.Id)
                .ToListAsync();

            var invalidIds = requestedMedicineIds.Except(existingMedicineIds).ToList();
            if (invalidIds.Any())
            {
                throw new ResourceNotFoundException($"Thuốc không tồn tại.");
            }

            prescription.Note = request.Note;

            // Clear and rebuild items
            var existingItems = _context.PrescriptionItems.Where(p => p.PrescriptionId == prescription.Id);
            _context.PrescriptionItems.RemoveRange(existingItems);

            prescription.PrescriptionItems = request.Items.Select(item => new PrescriptionItem
            {
                Id = Guid.NewGuid().ToString(),
                PrescriptionId = prescription.Id,
                MedicineId = item.MedicineId,
                Dosage = item.Dosage,
                Frequency = item.Frequency,
                Duration = item.Duration,
                Instructions = item.Instructions
            }).ToList();

            await _repository.UpdateAsync(prescription);
            await _context.SaveChangesAsync();

            return ToResponseDTO(prescription);
        }

        public async Task DeleteAsync(string id)
        {
            var prescription = await _repository.FindByIdAsync(id)
                              ?? throw new Exception(MessageConstants.PRESCRIPTION_NOT_FOUND);

            await _repository.DeleteAsync(prescription);
            await _context.SaveChangesAsync();
        }

        private PrescriptionResponseDTO ToResponseDTO(Prescription prescription)
        {
            return new PrescriptionResponseDTO
            {
                Id = prescription.Id,
                ExaminationResultId = prescription.ExaminationResultId,
                Note = prescription.Note ?? "",
                Items = prescription.PrescriptionItems.Select(ToItemResponseDTO).ToList()
            };
        }

        private PrescriptionItemResponseDTO ToItemResponseDTO(PrescriptionItem item)
        {
            return new PrescriptionItemResponseDTO
            {
                Id = item.Id,
                PrescriptionId = item.PrescriptionId,
                MedicineId = item.MedicineId,
                MedicineName = item.Medicine?.Name ?? "",
                Dosage = item.Dosage ?? "",
                Frequency = item.Frequency ?? "",
                Duration = item.Duration ?? "",
                Instructions = item.Instructions ?? ""
            };
        }
    }

}
