using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.LaboratoryResultRepositories
{
    public interface ILaboratoryResultRepository
    {
        Task<LaboratoryResult> CreateAsync(LaboratoryResult entity);
        Task<LaboratoryResult?> GetByIdAsync(string id);
        Task<LaboratoryResult?> GetByAssignmentIdAsync(string assignmentId);
        Task<List<LaboratoryResult>> GetByExaminationResultIdAsync(string examinationResultId);
        Task<LaboratoryResult> UpdateAsync(LaboratoryResult entity);
    }

}
