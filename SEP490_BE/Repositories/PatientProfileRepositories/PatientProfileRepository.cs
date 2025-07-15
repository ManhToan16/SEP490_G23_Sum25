using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;
using SEP490_BE.Services.AuthServices;

namespace SEP490_BE.Repositories.PatientProfileRepositories
{
    public class PatientProfileRepository : IPatientProfileRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public PatientProfileRepository(
          KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task Add(PatientProfile entity)
        {
            await _context.PatientProfiles.AddAsync(entity);
        }

        public Task Update(PatientProfile entity)
        {
            _context.PatientProfiles.Update(entity);
            return Task.CompletedTask;
        }

        public Task Delete(PatientProfile entity)
        {
            _context.PatientProfiles.Remove(entity);
            return Task.CompletedTask;
        }

        public async Task<PatientProfile?> FindById(string id)
        {
            return await _context.PatientProfiles.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<PatientProfile> FindByCitizenId(string citizenId)
        {
            return await _context.PatientProfiles.SingleOrDefaultAsync(p => p.CitizenId == citizenId);
        }

        public async Task<(List<PatientProfile>, int)> FindAll(
            string? name, DateTime? dob, string? citizenId, int pageNumber, int pageSize)
        {
            var query = _context.PatientProfiles.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(p => EF.Functions.Collate(p.Name, "Latin1_General_CI_AI").Contains(name));
            }

            if (dob.HasValue)
            {
                query = query.Where(p => p.DateOfBirth.Date == dob.Value.Date);
            }

            if (!string.IsNullOrWhiteSpace(citizenId))
            {
                query = query.Where(p => p.CitizenId.Contains(citizenId));
            }

            var totalItems = await query.CountAsync();

            var items = await query
                .OrderBy(p => p.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalItems);
        }


    }
}
