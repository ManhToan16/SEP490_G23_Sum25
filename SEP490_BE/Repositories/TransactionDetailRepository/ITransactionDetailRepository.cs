using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.TransactionDetailRepository
{
    public interface ITransactionDetailRepository
    {
        Task<List<TransactionDetail>> GetAllAsync();
        Task<TransactionDetail?> GetByIdAsync(Guid id);
        Task AddAsync(TransactionDetail detail);
        Task UpdateAsync(TransactionDetail detail);
        Task DeleteAsync(Guid id);
        // ITransactionDetailRepository.cs
        Task<int> GetTotalProvidedQuantityAsync(string parentTransactionId);

    }

}
