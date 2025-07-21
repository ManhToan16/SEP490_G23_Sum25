using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.LaboratoryResultRepositories
{
    public class LaboratoryFileRepository : ILaboratoryFileRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public LaboratoryFileRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<LaboratoryFile> AddAsync(LaboratoryFile file)
        {
            _context.LaboratoryFiles.Add(file);
            await _context.SaveChangesAsync();
            return file;
        }

        public async Task DeleteAsync(string fileId)
        {
            var file = await _context.LaboratoryFiles.FindAsync(fileId);
            if (file != null)
            {
                _context.LaboratoryFiles.Remove(file);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<LaboratoryFile?> GetByIdAsync(string id)
        {
            return await _context.LaboratoryFiles
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<LaboratoryFile>> GetByLaboratoryResultIdAsync(string labResultId)
        {
            return await _context.LaboratoryFiles
                .Where(x => x.LaboratoryResultId == labResultId)
                .ToListAsync();
        }
    }

}
