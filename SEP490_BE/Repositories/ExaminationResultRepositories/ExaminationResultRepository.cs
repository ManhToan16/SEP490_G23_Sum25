using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.ExaminationResultRepositories
{
    public class ExaminationResultRepository : IExaminationResultRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public ExaminationResultRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<ExaminationResult?> FindByIdAsync(string id)
        {
            return await _context.ExaminationResults.FindAsync(id);
        }

        public async Task<List<ExaminationResult>> FindByMedicalRecordIdAsync(string medicalRecordId)
        {
            return await _context.ExaminationResults
                .Where(x => x.MedicalRecordId == medicalRecordId)
                .ToListAsync();
        }

        public async Task InsertAsync(ExaminationResult result)
        {
            await _context.ExaminationResults.AddAsync(result);
        }

        public async Task UpdateAsync(ExaminationResult result)
        {
            _context.ExaminationResults.Update(result);
        }

        public async Task<ExaminationResult?> FindByAccessCodeAsync(string accessCode)
        {
            return await _context.ExaminationResults
                .FirstOrDefaultAsync(er => er.AccessCode == accessCode);
        }

    }

}
