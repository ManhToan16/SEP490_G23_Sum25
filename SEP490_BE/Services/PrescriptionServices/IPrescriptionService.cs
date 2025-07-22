using SEP490_BE.DTO.PrescriptionDTO;

namespace SEP490_BE.Services.PrescriptionServices
{
    public interface IPrescriptionService
    {
        Task<PrescriptionResponseDTO> CreateAsync(string examinationResultId, PrescriptionRequestDTO request);
        Task<PrescriptionResponseDTO?> GetByExaminationResultIdAsync(string examinationResultId);
        Task<PrescriptionResponseDTO> UpdateAsync(string id, PrescriptionRequestDTO request);
        Task DeleteAsync(string id);

    }

}
