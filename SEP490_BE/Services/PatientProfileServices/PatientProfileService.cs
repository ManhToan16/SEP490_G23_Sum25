using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.PatientProfileDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
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

        public PatientProfileService(
            KhanhAnNeurologyClinicContext context,
            IPatientProfileRepository patientProfileRepository)
        {
            _context = context;
            _patientProfileRepository = patientProfileRepository;
        }

        public async Task<PatientProfileResponseDTO> Create(PatientProfileRequestDTO request)
        {
            var exists = await _patientProfileRepository.FindByCitizenId(request.CitizenId);
            if (exists != null)
            {
                throw new ConflictDataException(MessageConstants.PATIENT_PROTILE_EXISTS);
            }
            var entity = new PatientProfile
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                CitizenId = request.CitizenId,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                Address = request.Address
            };
            await _patientProfileRepository.Add(entity);
            await _context.SaveChangesAsync();
            return MapToResponse(entity);
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
