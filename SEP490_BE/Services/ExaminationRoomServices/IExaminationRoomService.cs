using SEP490_BE.DTO;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO.ExaminationRoomDTO;

namespace SEP490_BE.Services.ExaminationRoomServices
{
    public interface IExaminationRoomService
    {
        Task<Pagination<ExaminationRoomResponseDTO>> GetAll(
            string? name,
            string? description,
            int pageNumber,
            int pageSize);
        Task<ExaminationRoomResponseDTO> GetById(string id);
        Task<ExaminationRoomResponseDTO> Create(CreateExaminationRoomDTO request);
        Task<ExaminationRoomResponseDTO> Update(string id, UpdateExaminationRoomDTO request);
        Task Delete(string id);
        Task<List<PatientInRoomDTO>> GetPatientsInRoomAsync(string roomId);
        Task<(List<PatientInRoomDTO> Patients, DoctorProfileResponseDTO Doctor)> GetPatientsAndDoctorInRoomAsync(string roomId);
        Task<DoctorProfileResponseDTO> GetDoctorInRoomAsync(string roomId,DateTime? date);
        Task<List<DoctorProfileResponseDTO>> GetAllDoctorsInRoomAsync(string roomId, DateTime? date);
    }
}
