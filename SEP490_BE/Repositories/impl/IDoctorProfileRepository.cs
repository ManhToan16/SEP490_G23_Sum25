using SEP490_BE.Models;

namespace SEP490_BE.Repositories.impl
{
    public interface IDoctorProfileRepository
    {
        Task<IEnumerable<DoctorProfile>> GetAllDoctorProfilesAsync();
        Task<DoctorProfile> GetDoctorProfileByIdAsync(string id);
        Task CreateDoctorProfileAsync(DoctorProfile doctorProfile);
        Task UpdateDoctorProfileAsync(DoctorProfile doctorProfile);
        Task DeleteDoctorProfileAsync(string id);
    }
}
