using SEP490_BE.DTO.DoctorScheduleDTO;
using SEP490_BE.DTO;

namespace SEP490_BE.Services.DoctorScheduleServices
{
    public interface IDoctorScheduleService
    {
        Task<Pagination<DoctorScheduleResponseDTO>> GetAll(
            string? doctorId,
            DateTime? date,
            bool? isAvailable,
            int pageNumber,
            int pageSize);
        Task<DoctorScheduleResponseDTO> GetById(string id);
        Task<DoctorScheduleResponseDTO> Create(CreateDoctorScheduleDTO request);
        Task<DoctorScheduleResponseDTO> Update(string id, UpdateDoctorScheduleDTO request);
        Task Delete(string id);
    }
}
