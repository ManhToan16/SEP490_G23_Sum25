using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.MedicalRecordRepositories
{
    public interface IMedicalRecordRepository
    {
        Task<MedicalRecord?> FindByIdAsync(string id);
        Task<MedicalRecord?> FindByPatientProfileIdAsync(string patientProfileId);
        Task InsertAsync(MedicalRecord record);
        Task UpdateAsync(MedicalRecord record);
    }
}
