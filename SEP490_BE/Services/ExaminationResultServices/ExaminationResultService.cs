using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO.ExaminationResultDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.ExaminationResultRepositories;
using SEP490_BE.Services.AuthServices;

namespace SEP490_BE.Services.ExaminationResultServices
{
    public class ExaminationResultService : IExaminationResultService
    {
        private readonly IExaminationResultRepository _repository;
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IAuthService _authService;

        public ExaminationResultService(
            IExaminationResultRepository repository, 
            KhanhAnNeurologyClinicContext context,
            IAuthService authService)
        {
            _repository = repository;
            _context = context;
            _authService = authService;
        }

        public async Task<ExaminationResultResponseDTO> CreateByVisitId(string visitId, ExaminationResultRequestDTO request)
        {
            var visit = await _context.Visits.FindAsync(visitId)
                ?? throw new ResourceNotFoundException(MessageConstants.VISIT_NOT_FOUND);

            var patient = await _context.PatientProfiles.FindAsync(visit.PatientProfileId)
                ?? throw new ResourceNotFoundException(MessageConstants.PATIENT_PROTILE_NOT_FOUND);

            var medRecord = await _context.MedicalRecords
                .FirstOrDefaultAsync(x => x.PatientProfileId == visit.PatientProfileId)
                ?? throw new Exceptions.ArgumentException(MessageConstants.MEDICAL_RECORD_NOT_FOUND);

            var sessionDoctor = await _authService.GetAuthenticatedUser();

            var examResult = new ExaminationResult
            {
                Id = Guid.NewGuid().ToString(),
                MedicalRecordId = medRecord.Id,
                DoctorId = sessionDoctor.Id,
                VisitId = visitId,
                Summary = request.Summary,
                Conclusion = request.Conclusion,
                AccessCode = await GenerateAccessCode(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.InsertAsync(examResult);
            await _context.SaveChangesAsync();

            return await ToResponseDTO(examResult);
        }

        public async Task<ExaminationResultResponseDTO> Update(string id, ExaminationResultRequestDTO request)
        {
            var result = await _repository.FindByIdAsync(id)
                ?? throw new ResourceNotFoundException(MessageConstants.EXAMINATION_RESULT_NOT_FOUND);

            var visit = await _context.Visits.FindAsync(result.VisitId)
                ?? throw new ResourceNotFoundException(MessageConstants.VISIT_NOT_FOUND);

            if (visit.Status == VisitStatus.CANCELLED || visit.Status == VisitStatus.COMPLETED)
                throw new InvalidOperationException(MessageConstants.EXAMINATION_RESULT_INVALID_UPDATE);

            result.Summary = request.Summary;
            result.Conclusion = request.Conclusion;
            result.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(result);
            await _context.SaveChangesAsync();

            return await ToResponseDTO(result);
        }

        public async Task<List<ExaminationResultResponseDTO>> GetByMedicalRecordId(string medicalRecordId)
        {
            var results = await _repository.FindByMedicalRecordIdAsync(medicalRecordId);
            var dtos = new List<ExaminationResultResponseDTO>();

            foreach (var result in results)
            {
                dtos.Add(await ToResponseDTO(result));
            }

            return dtos;
        }

        public async Task<ExaminationResultResponseDTO> GetById(string id)
        {
            var result = await _repository.FindByIdAsync(id)
                ?? throw new ResourceNotFoundException(MessageConstants.EXAMINATION_RESULT_NOT_FOUND);

            return await ToResponseDTO(result);
        }

        public async Task<ExaminationResultResponseDTO?> FindByAccessCode(string accessCode)
        {
            var result = await _repository.FindByAccessCodeAsync(accessCode);
            if (result == null)
            {
                throw new ResourceNotFoundException(MessageConstants.EXAMINATION_RESULT_NOT_FOUND);
            }

            return await ToResponseDTO(result);
        }


        private async Task<ExaminationResultResponseDTO> ToResponseDTO(ExaminationResult result)
        {
            var visit = await _context.Visits.FindAsync(result.VisitId);
            var patient = visit != null ? await _context.PatientProfiles.FindAsync(visit.PatientProfileId) : null;
            var doctor = await _context.Users.FindAsync(result.DoctorId);

            return new ExaminationResultResponseDTO
            {
                Id = result.Id,
                MedicalRecordId = result.MedicalRecordId,
                DoctorId = result.DoctorId,
                DoctorName = doctor.Name,
                VisitId = result.VisitId,
                PatientName = patient.Name,
                DateOfBirth = patient.DateOfBirth,
                AccessCode = result.AccessCode ?? "",
                Summary = result.Summary ?? "",
                Conclusion = result.Conclusion ?? "",
                CreatedAt = result.CreatedAt,
                UpdatedAt = result.UpdatedAt
            };
        }

        private async Task<string> GenerateAccessCode()
        {
            string accessCode;
            do
            {
                accessCode = Guid.NewGuid().ToString("N")[..8].ToUpper();
            } while (await _context.ExaminationResults.AnyAsync(x => x.AccessCode == accessCode));
            return accessCode;
        }

    }

}
