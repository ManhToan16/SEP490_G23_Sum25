using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.DoctorProfileRepositories;
using Microsoft.EntityFrameworkCore;

namespace SEP490_BE.Services.DoctorProfileServices
{
    public class DoctorProfileService : IDoctorProfileService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IDoctorProfileRepository _doctorProfileRepository;

        public DoctorProfileService(
            KhanhAnNeurologyClinicContext context,
            IDoctorProfileRepository doctorProfileRepository)
        {
            _context = context;
            _doctorProfileRepository = doctorProfileRepository;
        }

        public async Task<Pagination<DoctorProfileResponseDTO>> GetAll(
            string? qualifications,
            int? minYearsOfExperience,
            int? maxYearsOfExperience,
            int pageNumber,
            int pageSize)
        {
            var (doctorProfiles, totalItems) = await _doctorProfileRepository.FindAll(qualifications, minYearsOfExperience, maxYearsOfExperience, pageNumber, pageSize);
            return new Pagination<DoctorProfileResponseDTO>
            {
                Items = doctorProfiles.Select(dp => new DoctorProfileResponseDTO
                {
                    Id = dp.Id,
                    DoctorId = dp.DoctorId,
                    Qualifications = dp.Qualifications,
                    YearsOfExperience = dp.YearsOfExperience,
                    Biography = dp.Biography,
                    Avatar = dp.Avatar
                }).ToList(),
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<DoctorProfileResponseDTO> GetById(string id)
        {
            var doctorProfile = await _doctorProfileRepository.FindByIdAsync(id);
            if (doctorProfile == null)
            {
                throw new ResourceNotFoundException("Doctor profile not found.");
            }
            return new DoctorProfileResponseDTO
            {
                Id = doctorProfile.Id,
                DoctorId = doctorProfile.DoctorId,
                Qualifications = doctorProfile.Qualifications,
                YearsOfExperience = doctorProfile.YearsOfExperience,
                Biography = doctorProfile.Biography,
                Avatar = doctorProfile.Avatar
            };
        }

        public async Task<DoctorProfileResponseDTO> Create(CreateDoctorProfileDTO request)
        {
            var existingProfile = await _doctorProfileRepository.FindByDoctorIdAsync(request.DoctorId);
            if (existingProfile != null)
            {
                throw new ConflictDataException("Doctor already has a profile.");
            }

            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == request.DoctorId)
                .ToListAsync();
            if (userRoles == null || !userRoles.Any(ur => ur.RoleName == "DOCTOR"))
            {
                throw new UnauthorizedAccessException("Only users with DOCTOR role can have a profile.");
            }

            var user = await _context.Users.FindAsync(request.DoctorId);
            if (user == null)
            {
                throw new ResourceNotFoundException("Doctor not found.");
            }

            var doctorProfile = new DoctorProfile
            {
                Id = Guid.NewGuid().ToString(),
                DoctorId = request.DoctorId,
                Qualifications = request.Qualifications,
                YearsOfExperience = request.YearsOfExperience,
                Biography = request.Biography,
                Avatar = request.Avatar
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _doctorProfileRepository.InsertAsync(doctorProfile);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new DoctorProfileResponseDTO
            {
                Id = doctorProfile.Id,
                DoctorId = doctorProfile.DoctorId,
                Qualifications = doctorProfile.Qualifications,
                YearsOfExperience = doctorProfile.YearsOfExperience,
                Biography = doctorProfile.Biography,
                Avatar = doctorProfile.Avatar
            };
        }

        public async Task<DoctorProfileResponseDTO> Update(string id, UpdateDoctorProfileDTO request)
        {
            var doctorProfile = await _doctorProfileRepository.FindByIdAsync(id);
            if (doctorProfile == null)
            {
                throw new ResourceNotFoundException("Doctor profile not found.");
            }

            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == doctorProfile.DoctorId)
                .ToListAsync();
            if (userRoles == null || !userRoles.Any(ur => ur.RoleName == "DOCTOR"))
            {
                throw new UnauthorizedAccessException("Only users with DOCTOR role can have a profile updated.");
            }

            doctorProfile.Qualifications = request.Qualifications;
            doctorProfile.YearsOfExperience = request.YearsOfExperience;
            doctorProfile.Biography = request.Biography;
            doctorProfile.Avatar = request.Avatar;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _doctorProfileRepository.UpdateAsync(doctorProfile);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new DoctorProfileResponseDTO
            {
                Id = doctorProfile.Id,
                DoctorId = doctorProfile.DoctorId,
                Qualifications = doctorProfile.Qualifications,
                YearsOfExperience = doctorProfile.YearsOfExperience,
                Biography = doctorProfile.Biography,
                Avatar = doctorProfile.Avatar
            };
        }

        public async Task Delete(string id)
        {
            var doctorProfile = await _doctorProfileRepository.FindByIdAsync(id);
            if (doctorProfile == null)
            {
                throw new ResourceNotFoundException("Doctor profile not found.");
            }

            await _doctorProfileRepository.DeleteAsync(doctorProfile);
            await _context.SaveChangesAsync();
        }
    }
}