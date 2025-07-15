using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.TransactionRepositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public TransactionRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<Transaction> FindByIdAsync(string id)
        {
            return await _context.Transactions
                .Include(t => t.Material)
                .Include(t => t.User)
                .Include(t => t.TransactionHistories)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task AddAsync(Transaction transaction)
        {
            await _context.Transactions.AddAsync(transaction);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Transaction transaction)
        {
            _context.Transactions.Update(transaction);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Transaction transaction)
        {
                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();
            
        }

        public async Task<(List<Transaction> Transactions, int TotalItems)> FindAll(string? materialId, string? transactionType, string? status, int pageNumber, int pageSize)
        {
            var query = _context.Transactions
                .Include(t => t.Material)
                .Include(t => t.User)
                .Include(t => t.TransactionHistories)
                .AsQueryable();

            if (!string.IsNullOrEmpty(materialId))
            {
                query = query.Where(t => t.MaterialId == materialId);
            }

            if (!string.IsNullOrEmpty(transactionType))
            {
                query = query.Where(t => t.TransactionType == transactionType);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(t => t.Status == status);
            }

            int totalItems = await query.CountAsync();

            var transactions = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (transactions, totalItems);
        }

        public async Task AddTransactionHistoryAsync(TransactionHistory history)
        {
            await _context.TransactionHistories.AddAsync(history);
            await _context.SaveChangesAsync();
        }
    }
}
