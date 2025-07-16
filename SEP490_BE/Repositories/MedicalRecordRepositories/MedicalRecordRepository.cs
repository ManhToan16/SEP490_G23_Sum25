using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.MedicalRecordRepositories
{
    public class MedicalRecordRepository : IMedicalRecordRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public MedicalRecordRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<MedicalRecord?> FindByIdAsync(string id)
        {
            return await _context.MedicalRecords
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<MedicalRecord?> FindByPatientProfileIdAsync(string patientProfileId)
        {
            return await _context.MedicalRecords
                .FirstOrDefaultAsync(r => r.PatientProfileId == patientProfileId);
        }

        public async Task InsertAsync(MedicalRecord record)
        {
            await _context.MedicalRecords.AddAsync(record);
        }

        public async Task UpdateAsync(MedicalRecord record)
        {
            _context.MedicalRecords.Update(record);
        }
    }

}
