using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.PatientProfileDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
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

        public PatientProfileService(
            KhanhAnNeurologyClinicContext context,
            IPatientProfileRepository patientProfileRepository,
            IMedicalRecordRepository medicalRecordRepository)
        {
            _context = context;
            _patientProfileRepository = patientProfileRepository;
            _medicalRecordRepository = medicalRecordRepository;
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
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _patientProfileRepository.Add(patientProfile);
                await _medicalRecordRepository.InsertAsync(medicalRecord);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return MapToResponse(patientProfile);
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
            entity.Name = request.Name;
            entity.CitizenId = request.CitizenId;
            entity.PhoneNumber = request.PhoneNumber;
            entity.Email = request.Email;
            entity.DateOfBirth = request.DateOfBirth;
            entity.Gender = request.Gender;
            entity.Address = request.Address;

            await _patientProfileRepository.Update(entity);
            await _context.SaveChangesAsync();

            return MapToResponse(entity);
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
