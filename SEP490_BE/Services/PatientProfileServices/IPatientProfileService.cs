using SEP490_BE.DTO;
using SEP490_BE.DTO.PatientProfileDTO;
using SEP490_BE.DTO.UserDTO;

namespace SEP490_BE.Services.PatientProfileServices
{
    public interface IPatientProfileService
    {
        Task<PatientProfileResponseDTO> Create(PatientProfileRequestDTO request);
        Task<PatientProfileResponseDTO> Update(string id, PatientProfileRequestDTO request);
        Task<PatientProfileResponseDTO> GetById(string id);
        Task<Pagination<PatientProfileResponseDTO>> GetAll(
            string? name,
            DateTime? dateOfBirth,
            string? citizenId,
            int pageNumber,
            int pageSize);
    }
}
