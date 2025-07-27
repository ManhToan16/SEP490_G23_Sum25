using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.MedicalRecordDTO;
using SEP490_BE.DTO.PatientProfileDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.MedicalRecordRepositories;
using SEP490_BE.Repositories.PatientProfileRepositories;
using SEP490_BE.Repositories.RoleRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Services.AuthServices;
using StackExchange.Redis;

namespace SEP490_BE.Services.PatientProfileServices
{
    public class PatientProfileService : IPatientProfileService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IPatientProfileRepository _patientProfileRepository;
        private readonly IMedicalRecordRepository _medicalRecordRepository;
        private readonly IAuthService _authService;
        private readonly IAuditLogRepository _auditLogRepository;

        public PatientProfileService(
            KhanhAnNeurologyClinicContext context,
            IPatientProfileRepository patientProfileRepository,
            IMedicalRecordRepository medicalRecordRepository,
            IAuthService authService,
            IAuditLogRepository auditLogRepository)
        {
            _context = context;
            _patientProfileRepository = patientProfileRepository;
            _medicalRecordRepository = medicalRecordRepository;
            _authService = authService;
            _auditLogRepository = auditLogRepository;
        }

        public async Task<PatientProfileResponseDTO> Create(PatientProfileRequestDTO request)
        {
            var exists = await _patientProfileRepository.FindByCitizenId(request.CitizenId);
            if (exists != null)
            {
                throw new ConflictDataException(MessageConstants.PATIENT_PROTILE_EXISTS);
            }

            var patientProfileId = Guid.NewGuid().ToString();
            var patientProfile = new PatientProfile
            {
                Id = patientProfileId,
                Name = request.Name,
                CitizenId = request.CitizenId,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                Address = request.Address
            };
            var medicalRecord = new MedicalRecord
            {
                Id = Guid.NewGuid().ToString(),
                PatientProfileId = patientProfileId,
                MedicalHistory = "",
                Allergies = "",
                SurgicalHistory = "",
                Treatment = "",
                CurrentMedications = "",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };


            var sessionUser = await _authService.GetAuthenticatedUser();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _patientProfileRepository.Add(patientProfile);
                await _medicalRecordRepository.InsertAsync(medicalRecord);
                await _context.SaveChangesAsync();

                var patientProfileResponse = MapToResponse(patientProfile);
                var medicalRecordResponse = new MedicalRecordResponseDTO
                {
                    MedicalRecordId = medicalRecord.Id,
                    PatientProfileId = patientProfileId,
                    MedicalHistory = medicalRecord.MedicalHistory,
                    Allergies = medicalRecord.Allergies,
                    SurgicalHistory = medicalRecord.SurgicalHistory,
                    Treatment = medicalRecord.Treatment,
                    CurrentMedications = medicalRecord.CurrentMedications,
                };

                await _auditLogRepository.LogAsync(sessionUser.Id, "CREATE", "PatientProfiles", patientProfile.Id, null, patientProfileResponse);
                await _auditLogRepository.LogAsync(sessionUser.Id, "CREATE", "MedicalRecords", medicalRecord.Id, null, medicalRecordResponse);

                await transaction.CommitAsync();
                return patientProfileResponse;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        public async Task<Pagination<PatientProfileResponseDTO>> GetAll(string? name, DateTime? dateOfBirth, string? citizenId, int pageNumber, int pageSize)
        {
            var (patientProfiles, totalItems) = await _patientProfileRepository.FindAll(name, dateOfBirth, citizenId, pageNumber, pageSize);
            return new Pagination<PatientProfileResponseDTO>
            {
                Items = patientProfiles.Select(MapToResponse).ToList(),
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalItems = totalItems
            };
        }

        public async Task<PatientProfileResponseDTO> GetById(string id)
        {
            var entity = await _patientProfileRepository.FindById(id);
            if (entity == null)
            {
                throw new ResourceNotFoundException(MessageConstants.PATIENT_PROTILE_NOT_FOUND);
            }

            return MapToResponse(entity);
        }

        public async Task<PatientProfileResponseDTO> Update(string id, PatientProfileRequestDTO request)
        {
            var entity = await _patientProfileRepository.FindById(id);
            if (entity == null)
            {
                throw new ResourceNotFoundException(MessageConstants.PATIENT_PROTILE_NOT_FOUND);
            }
            var entityCitizen = await _patientProfileRepository.FindByCitizenId(request.CitizenId);
            if (entityCitizen != null && entity.CitizenId != request.CitizenId) {
                throw new ConflictDataException(MessageConstants.PATIENT_PROTILE_EXISTS);
            }

            var sessionUser = await _authService.GetAuthenticatedUser();
            var oldData = MapToResponse(entity);

            entity.Name = request.Name;
            entity.CitizenId = request.CitizenId;
            entity.PhoneNumber = request.PhoneNumber;
            entity.Email = request.Email;
            entity.DateOfBirth = request.DateOfBirth;
            entity.Gender = request.Gender;
            entity.Address = request.Address;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _patientProfileRepository.Update(entity);
                await _context.SaveChangesAsync();

                var newData = MapToResponse(entity);
                await _auditLogRepository.LogAsync(sessionUser.Id, "UPDATE", "PatientProfiles", entity.Id, oldData, newData);

                await transaction.CommitAsync();
                return newData;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private static PatientProfileResponseDTO MapToResponse(PatientProfile entity)
        {
            return new PatientProfileResponseDTO
            {
                Id = entity.Id,
                Name = entity.Name,
                CitizenId = entity.CitizenId,
                PhoneNumber = entity.PhoneNumber,
                Email = entity.Email,
                DateOfBirth = entity.DateOfBirth,
                Gender = entity.Gender,
                Address = entity.Address
            };
        }
    }

}
