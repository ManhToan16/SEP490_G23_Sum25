using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.LaboratoryResultRepositories
{
    public class LaboratoryResultRepository : ILaboratoryResultRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public LaboratoryResultRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<LaboratoryResult> CreateAsync(LaboratoryResult entity)
        {
            _context.LaboratoryResults.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<LaboratoryResult?> GetByIdAsync(string id)
        {
            return await _context.LaboratoryResults
                .Include(x => x.LaboratoryFiles)
                .Include(x => x.Technician)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<LaboratoryResult?> GetByAssignmentIdAsync(string assignmentId)
        {
            return await _context.LaboratoryResults
                .Include(x => x.LaboratoryFiles)
                .Include(x => x.Technician)
                .FirstOrDefaultAsync(x => x.AssignmentId == assignmentId);
        }

        public async Task<List<LaboratoryResult>> GetByExaminationResultIdAsync(string examinationResultId)
        {
            return await _context.LaboratoryResults
                .Include(x => x.LaboratoryFiles)
                .Include(x => x.Technician)
                .Where(x => x.ExaminationResultId == examinationResultId)
                .ToListAsync();
        }

        public async Task<LaboratoryResult> UpdateAsync(LaboratoryResult entity)
        {
            _context.LaboratoryResults.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }
    }

}
