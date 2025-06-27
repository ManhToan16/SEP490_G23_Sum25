using SEP490_BE.DTO.DoctorScheduleDTO;
using SEP490_BE.DTO;

namespace SEP490_BE.Services.DoctorScheduleServices
{
    public interface IDoctorScheduleService
    {
        Task<DoctorScheduleResponseDTO> GetById(string id);
        Task<DoctorScheduleResponseDTO> Create(CreateDoctorScheduleDTO request);
        Task<DoctorScheduleResponseDTO> Update(string id, UpdateDoctorScheduleDTO request);
        Task Delete(string id);
        Task<List<DoctorScheduleResponseDTO>> GetDoctorSchedulesByDoctorId(
            string doctorId,
            DateTime fromDate,
            DateTime toDate); 
        Task<List<DoctorScheduleResponseDTO>> GetDoctorSchedulesByRange(
            DateTime fromDate,
            DateTime toDate);
    }
}
