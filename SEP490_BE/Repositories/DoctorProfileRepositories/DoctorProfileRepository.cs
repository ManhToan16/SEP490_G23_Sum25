using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.DoctorProfileRepositories;

namespace SEP490_BE.Repositories.DoctorProfileRepositories
{
    public class DoctorProfileRepository : IDoctorProfileRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public DoctorProfileRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<DoctorProfile> FindByIdAsync(string id)
        {
            return await _context.DoctorProfiles.FindAsync(id);
        }

        public async Task<DoctorProfile> FindByDoctorIdAsync(string doctorId)
        {
            return await _context.DoctorProfiles.FirstOrDefaultAsync(dp => dp.DoctorId == doctorId);
        }

        public async Task<(List<DoctorProfile> DoctorProfiles, int TotalItems)> FindAll(
            string? qualifications,
            int? minYearsOfExperience,
            int? maxYearsOfExperience,
            int pageNumber,
            int pageSize)
        {
            var query = _context.DoctorProfiles.AsQueryable();
            if (!string.IsNullOrWhiteSpace(qualifications))
            {
                query = query.Where(dp => dp.Qualifications.Contains(qualifications));
            }
            if (minYearsOfExperience.HasValue)
            {
                query = query.Where(dp => dp.YearsOfExperience >= minYearsOfExperience);
            }
            if (maxYearsOfExperience.HasValue)
            {
                query = query.Where(dp => dp.YearsOfExperience <= maxYearsOfExperience);
            }

            var totalItems = await query.CountAsync();
            var doctorProfiles = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (doctorProfiles, totalItems);
        }

        public async Task InsertAsync(DoctorProfile doctorProfile)
        {
            await _context.DoctorProfiles.AddAsync(doctorProfile);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(DoctorProfile doctorProfile)
        {
            _context.DoctorProfiles.Update(doctorProfile);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(DoctorProfile doctorProfile)
        {
            _context.DoctorProfiles.Remove(doctorProfile);
            await _context.SaveChangesAsync();
        }
    }
}