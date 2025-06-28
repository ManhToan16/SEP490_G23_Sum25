using SEP490_BE.DTO.TechnicianScheduleDTO;
using SEP490_BE.DTO;

namespace SEP490_BE.Services.TechnicianScheduleServices
{
    public interface ITechnicianScheduleService
    {      
        Task<TechnicianScheduleResponseDTO> GetById(string id);
        Task<TechnicianScheduleResponseDTO> Create(CreateTechnicianScheduleDTO request);
        Task<TechnicianScheduleResponseDTO> Update(string id, UpdateTechnicianScheduleDTO request);
        Task Delete(string id);
        Task<List<TechnicianScheduleResponseDTO>> GetTechnicianSchedulesByTechnicianId(
           string technicianId,
           DateTime fromDate,
           DateTime toDate);
        Task<List<TechnicianScheduleResponseDTO>> GetTechnicianSchedulesByRange(
            DateTime fromDate,
            DateTime toDate);
        Task<List<TechnicianScheduleResponseDTO>> GetTechnicianSchedulesByLaboratoryRoom(
            string laboratoryRoomId,
            DateTime fromDate,
            DateTime toDate);
    }
}
