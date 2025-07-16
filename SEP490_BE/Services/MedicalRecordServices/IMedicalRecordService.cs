using SEP490_BE.DTO.MedicalRecordDTO;

namespace SEP490_BE.Services.MedicalRecordServices
{
    public interface IMedicalRecordService
    {
        Task<MedicalRecordResponseDTO> Create(string patientProfileId, MedicalRecordRequestDTO request);
        Task<MedicalRecordResponseDTO> Update(string medicalRecordId, MedicalRecordRequestDTO request);
        Task<MedicalRecordResponseDTO?> FindByPatientProfileId(string patientProfileId);
        Task<MedicalRecordResponseDTO> GetById(string medicalRecordId);

    }

}
