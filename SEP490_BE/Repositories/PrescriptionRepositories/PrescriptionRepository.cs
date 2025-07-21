using Microsoft.EntityFrameworkCore;
using SEP490_BE.DTO.PrescriptionDTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.PrescriptionRepositories
{
    public class PrescriptionRepository : IPrescriptionRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public PrescriptionRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<Prescription?> FindByExaminationResultIdAsync(string examinationResultId)
        {
            return await _context.Prescriptions
                .Include(p => p.PrescriptionItems)
                .ThenInclude(i => i.Medicine)
                .FirstOrDefaultAsync(p => p.ExaminationResultId == examinationResultId);
        }

        public async Task<Prescription?> FindByIdAsync(string id)
        {
            return await _context.Prescriptions
                .Include(p => p.PrescriptionItems)
                .ThenInclude(i => i.Medicine)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task AddAsync(Prescription prescription)
        {
            await _context.Prescriptions.AddAsync(prescription);
        }

        public Task UpdateAsync(Prescription prescription)
        {
            _context.Prescriptions.Update(prescription);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(Prescription prescription)
        {
            _context.PrescriptionItems.RemoveRange(prescription.PrescriptionItems);
            _context.Prescriptions.Remove(prescription);
            await Task.CompletedTask;
        }

    }


}
