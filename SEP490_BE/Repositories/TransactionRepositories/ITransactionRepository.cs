using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.TransactionRepositories
{
    public interface ITransactionRepository
    {
        Task<Transaction> FindByIdAsync(string id);
        Task AddAsync(Transaction transaction);
        Task UpdateAsync(Transaction transaction);
        Task DeleteAsync(Transaction transaction);
        Task<(List<Transaction> Transactions, int TotalItems)> FindAll(string? materialId, string? transactionType, string? status, int pageNumber, int pageSize);
        Task AddTransactionHistoryAsync(TransactionHistory history);
    }
}
