using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.PatientProfileRepositories
{
    public interface IPatientProfileRepository
    {
        Task<PatientProfile> FindByCitizenId(string citizenId);
        Task<PatientProfile?> FindById(string id);
        Task<(List<PatientProfile>, int)> FindAll(string? name, DateTime? dob, string? citizenId, int pageNumber, int pageSize);
        Task Add(PatientProfile entity);
        Task Update(PatientProfile entity);
        Task Delete(PatientProfile entity);
    }
}
