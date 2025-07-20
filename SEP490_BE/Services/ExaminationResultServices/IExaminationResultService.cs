using SEP490_BE.DTO.ExaminationResultDTO;

namespace SEP490_BE.Services.ExaminationResultServices
{
    public interface IExaminationResultService
    {
        Task<ExaminationResultResponseDTO> CreateByVisitId(string visitId, ExaminationResultRequestDTO request);
        Task<ExaminationResultResponseDTO> Update(string id, ExaminationResultRequestDTO request);
        Task<List<ExaminationResultResponseDTO>> GetByMedicalRecordId(string medicalRecordId);
        Task<ExaminationResultResponseDTO> GetById(string id);
        Task<ExaminationResultResponseDTO?> FindByAccessCode(string accessCode);

    }
}
