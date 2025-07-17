using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.ExaminationResultRepositories
{
    public interface IExaminationResultRepository
    {
        Task<ExaminationResult?> FindByIdAsync(string id);
        Task<List<ExaminationResult>> FindByMedicalRecordIdAsync(string medicalRecordId);
        Task InsertAsync(ExaminationResult result);
        Task UpdateAsync(ExaminationResult result);
        Task<ExaminationResult?> FindByAccessCodeAsync(string accessCode);

    }

}
