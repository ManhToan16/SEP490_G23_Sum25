using SEP490_BE.DTO.AppointmentDTO;
using SEP490_BE.DTO.UserDTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.AppointmentRepositories
{
    public interface IAppointmentRepository
    {
        Task<Appointment> FindById(string id);
        Task<(List<AppointmentResponseDTO> appointments, int totalItems)> FindAll(
            string? name,
            string? email,
            string? phoneNumber,
            DateTime? dob,
            DateTime? date,
            string? status,
            int pageNumber,
            int pageSize);
        Task Insert(Appointment appointment);
        Task Update(Appointment appointment);
    }
}
