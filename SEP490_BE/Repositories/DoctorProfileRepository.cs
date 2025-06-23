using Microsoft.EntityFrameworkCore;
using SEP490_BE.Models;
using SEP490_BE.Repositories.impl;

namespace SEP490_BE.Repositories
{
    public class DoctorProfileRepository : IDoctorProfileRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public DoctorProfileRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DoctorProfile>> GetAllDoctorProfilesAsync()
        {
            return await _context.DoctorProfiles.ToListAsync();
        }

        public async Task<DoctorProfile> GetDoctorProfileByIdAsync(string id)
        {
            return await _context.DoctorProfiles.FindAsync(id);
        }

        public async Task CreateDoctorProfileAsync(DoctorProfile doctorProfile)
        {
            var user = await _context.Users.FindAsync(doctorProfile.DoctorId);
            if (user == null) throw new ArgumentException("DoctorId does not exist.");
            _context.DoctorProfiles.Add(doctorProfile);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateDoctorProfileAsync(DoctorProfile doctorProfile)
        {
            var existingProfile = await _context.DoctorProfiles.FindAsync(doctorProfile.Id);
            if (existingProfile == null) throw new ArgumentException("DoctorProfile not found.");
            _context.Entry(existingProfile).CurrentValues.SetValues(doctorProfile);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteDoctorProfileAsync(string id)
        {
            var doctorProfile = await GetDoctorProfileByIdAsync(id);
            if (doctorProfile != null)
            {
                _context.DoctorProfiles.Remove(doctorProfile);
                await _context.SaveChangesAsync();
            }
        }
    }
    
}
