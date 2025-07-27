using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO.MedicalRecordDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.MedicalRecordRepositories;
using SEP490_BE.Services.FileServices;
using Microsoft.AspNetCore.Http;

namespace SEP490_BE.Services.MedicalRecordServices
{
    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly IMedicalRecordRepository _repository;
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IFileService _fileService;
        private readonly IConfiguration _configuration;

        public MedicalRecordService(
            IMedicalRecordRepository repository, 
            KhanhAnNeurologyClinicContext context,
            IFileService fileService,
            IConfiguration configuration)
        {
            _repository = repository;
            _context = context;
            _fileService = fileService;
            _configuration = configuration;
        }

        public async Task<MedicalRecordResponseDTO> Create(string patientProfileId, MedicalRecordRequestDTO request)
        {
            var existing = await _repository.FindByPatientProfileIdAsync(patientProfileId);
            if (existing != null)
                throw new ConflictDataException(MessageConstants.MEDICAL_RECORD_CONFLICT);

            var newRecord = new MedicalRecord
            {
                Id = Guid.NewGuid().ToString(),
                PatientProfileId = patientProfileId,
                MedicalHistory = request.MedicalHistory,
                Allergies = request.Allergies,
                SurgicalHistory = request.SurgicalHistory,
                Treatment = request.Treatment,
                CurrentMedications = request.CurrentMedications,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.InsertAsync(newRecord);
            await _context.SaveChangesAsync();

            return ToDTO(newRecord);
        }

        public async Task<MedicalRecordResponseDTO> Update(string medicalRecordId, MedicalRecordRequestDTO request)
        {
            var record = await _repository.FindByIdAsync(medicalRecordId);
            if (record == null)
                throw new ResourceNotFoundException(MessageConstants.MEDICAL_RECORD_NOT_FOUND);

            record.MedicalHistory = request.MedicalHistory;
            record.Allergies = request.Allergies;
            record.SurgicalHistory = request.SurgicalHistory;
            record.Treatment = request.Treatment;
            record.CurrentMedications = request.CurrentMedications;
            record.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(record);
            await _context.SaveChangesAsync();

            return ToDTO(record);
        }

        public async Task<MedicalRecordResponseDTO?> FindByPatientProfileId(string patientProfileId)
        {
            var patientExists = await _context.PatientProfiles.AnyAsync(p => p.Id == patientProfileId);
            if (!patientExists)
                throw new ResourceNotFoundException(MessageConstants.PATIENT_PROTILE_NOT_FOUND);

            var record = await _repository.FindByPatientProfileIdAsync(patientProfileId);
            if (record == null)
                throw new ResourceNotFoundException(MessageConstants.MEDICAL_RECORD_NOT_FOUND);

            return ToDTO(record);
        }


        public async Task<MedicalRecordResponseDTO> GetById(string medicalRecordId)
        {
            var record = await _repository.FindByIdAsync(medicalRecordId);
            if (record == null)
                throw new ResourceNotFoundException(MessageConstants.MEDICAL_RECORD_NOT_FOUND);

            return ToDTO(record);
        }

        private static MedicalRecordResponseDTO ToDTO(MedicalRecord record)
        {
            return new MedicalRecordResponseDTO
            {
                MedicalRecordId = record.Id,
                PatientProfileId = record.PatientProfileId,
                MedicalHistory = record.MedicalHistory ?? "",
                Allergies = record.Allergies ?? "",
                SurgicalHistory = record.SurgicalHistory ?? "",
                Treatment = record.Treatment ?? "",
                CurrentMedications = record.CurrentMedications ?? ""
            };
        }

        // Thêm method upload vào MedicalRecordService
        public async Task<string> UploadMedicalRecord(string medicalRecordId, IFormFile file)
        {
            var medicalRecord = await _repository.FindByIdAsync(medicalRecordId)
                ?? throw new ResourceNotFoundException("Không tìm thấy hồ sơ bệnh án");

            // Tự động tạo folder /opt/khanhan/uploads/medicalRecords/
            var url = await _fileService.SaveFileAsync(file, "medicalRecords/");
            
            // Tạo URL đầy đủ
            var backendUrl = _configuration["App:BackendUrl"]?.TrimEnd('/');
            var finalUrl = $"{backendUrl}/uploads/{url.TrimStart('/')}";
            
            return finalUrl;
        }

    }

}
