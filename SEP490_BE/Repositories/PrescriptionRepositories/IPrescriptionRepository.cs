using SEP490_BE.DTO.PrescriptionDTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.PrescriptionRepositories
{
    public interface IPrescriptionRepository
    {
        Task<Prescription?> FindByExaminationResultIdAsync(string examinationResultId);
        Task<Prescription?> FindByIdAsync(string id);
        Task AddAsync(Prescription prescription);
        Task UpdateAsync(Prescription prescription);
        Task DeleteAsync(Prescription prescription);

    }

}
