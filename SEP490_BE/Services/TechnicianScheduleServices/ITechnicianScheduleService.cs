using SEP490_BE.DTO.TechnicianScheduleDTO;
using SEP490_BE.DTO;

namespace SEP490_BE.Services.TechnicianScheduleServices
{
    public interface ITechnicianScheduleService
    {
        Task<Pagination<TechnicianScheduleResponseDTO>> GetAll(
            string? technicianId,
            DateTime? date,
            int pageNumber,
            int pageSize);
        Task<TechnicianScheduleResponseDTO> GetById(string id);
        Task<TechnicianScheduleResponseDTO> Create(CreateTechnicianScheduleDTO request);
        Task<TechnicianScheduleResponseDTO> Update(string id, UpdateTechnicianScheduleDTO request);
        Task Delete(string id);
    }
}
