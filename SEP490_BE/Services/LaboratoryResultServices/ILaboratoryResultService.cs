using SEP490_BE.DTO.LaboratoryResultDTO;

namespace SEP490_BE.Services.LaboratoryResultServices
{
    public interface ILaboratoryResultService
    {
        Task<LaboratoryResultResponseDTO> CreateByAssignmentId(string assignmentId, LaboratoryResultRequestDTO requestDTO);
        Task<LaboratoryResultResponseDTO> GetByAssignmentId(string assignmentId);
        Task<LaboratoryResultResponseDTO> GetById(string id);
        Task<List<LaboratoryResultResponseDTO>> GetListByExaminationId(string examinationResultId);
        Task<LaboratoryResultResponseDTO> UpdateById(string id, LaboratoryResultRequestDTO request);

        Task<List<LaboratoryFilesResponseDTO>> UploadFiles(string laboratoryResultId, List<IFormFile> files);
        Task DeleteFileById(string fileId);
    }

}
