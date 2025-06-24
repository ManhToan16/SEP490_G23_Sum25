

using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.DoctorProfileRepositories
{
    public interface IDoctorProfileRepository
    {
        Task<DoctorProfile> FindByIdAsync(string id);
        Task<DoctorProfile> FindByDoctorIdAsync(string doctorId);
        Task<(List<DoctorProfile> DoctorProfiles, int TotalItems)> FindAll(
            string? qualifications,
            int? minYearsOfExperience,
            int? maxYearsOfExperience,
            int pageNumber,
            int pageSize);
        Task InsertAsync(DoctorProfile doctorProfile);
        Task UpdateAsync(DoctorProfile doctorProfile);
        Task DeleteAsync(DoctorProfile doctorProfile);
    }
}