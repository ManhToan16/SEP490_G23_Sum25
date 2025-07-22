using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.LaboratoryResultRepositories
{
    public interface ILaboratoryFileRepository
    {
        Task<LaboratoryFile> AddAsync(LaboratoryFile file);
        Task DeleteAsync(string fileId);
        Task<LaboratoryFile?> GetByIdAsync(string id);
        Task<List<LaboratoryFile>> GetByLaboratoryResultIdAsync(string labResultId);
    }
}
