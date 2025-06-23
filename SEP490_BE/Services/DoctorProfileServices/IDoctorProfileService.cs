using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO;

namespace SEP490_BE.Services.DoctorProfileServices
{
    public interface IDoctorProfileService
    {
        Task<Pagination<DoctorProfileResponseDTO>> GetAll(
            string? qualifications,
            int? minYearsOfExperience,
            int? maxYearsOfExperience,
            int pageNumber,
            int pageSize);
        Task<DoctorProfileResponseDTO> GetById(string id);
        Task<DoctorProfileResponseDTO> Create(CreateDoctorProfileDTO request);
        Task<DoctorProfileResponseDTO> Update(string id, UpdateDoctorProfileDTO request);
        Task Delete(string id);
    }
}
