using SEP490_BE.DTO.UserDTO;
using SEP490_BE.DTO;
using SEP490_BE.DTO.AppointmentDTO;

namespace SEP490_BE.Services.AppointmentServices
{
    public interface IAppointmentService
    {
        Task<Pagination<AppointmentResponseDTO>> GetAll(
            string? name,
            string? email,
            string? phoneNumber,
            DateTime? dob,
            DateTime? date,
            string? status,
            int pageNumber,
            int pageSize);
        Task<AppointmentResponseDTO> GetById(string id);
        Task<AppointmentResponseDTO> Create(AppointmentRequestDTO request);
        Task<AppointmentResponseDTO> CreatedByReceptionist(AppointmentRequestDTO request);
        Task<AppointmentResponseDTO> Update(string id, AppointmentRequestDTO request);
        Task<AppointmentResponseDTO> UpdateStatus(string id, string status);
        Task Confirm(string id);
        Task Cancel(string id);
        Task PrintInvoice(string id);
        Task MarkAsPaid(string id);


    }
}
