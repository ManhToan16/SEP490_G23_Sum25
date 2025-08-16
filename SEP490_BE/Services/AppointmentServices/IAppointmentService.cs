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
        Task<AppointmentResponseDTO> CreatedByClinic(AppointmentRequestDTO request);
        Task<AppointmentResponseDTO> Update(string id, AppointmentRequestDTO request);
        Task<AppointmentResponseDTO> CheckIn(string id);
        Task<AppointmentResponseDTO> Confirm(string id);
        Task<AppointmentResponseDTO> Cancel(string id, CancelAppointmentDTO request);
        Task<byte[]> GenerateInvoicePdf(string id);
        Task<AppointmentResponseDTO> MarkAsPaid(string id);
        Task AutoExpired();
    }
}
