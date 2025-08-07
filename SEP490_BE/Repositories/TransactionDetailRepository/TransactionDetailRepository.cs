using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.TransactionDetailRepository
{
    public class TransactionDetailRepository : ITransactionDetailRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public TransactionDetailRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<List<TransactionDetail>> GetAllAsync()
        {
            return await _context.TransactionDetails
                .Include(d => d.Transaction)
                .Include(d => d.ParentTransaction)
                .ToListAsync();
        }
        // TransactionDetailRepository.cs
        public async Task<int> GetTotalProvidedQuantityAsync(string parentTransactionId)
        {
            return await _context.TransactionDetails
                .Where(d => d.ParentTransactionId == parentTransactionId)
                .SumAsync(d => d.QuantityProvided ?? 0);
        }

        public async Task<TransactionDetail?> GetByIdAsync(Guid id)
        {
            return await _context.TransactionDetails
                .Include(d => d.Transaction)
                .Include(d => d.ParentTransaction)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task AddAsync(TransactionDetail detail)
        {
            await _context.TransactionDetails.AddAsync(detail);
        }

        public async Task UpdateAsync(TransactionDetail detail)
        {
            _context.TransactionDetails.Update(detail);
        }

        public async Task DeleteAsync(Guid id)
        {
            var detail = await GetByIdAsync(id);
            if (detail != null)
            {
                _context.TransactionDetails.Remove(detail);
            }
        }
    }

}
