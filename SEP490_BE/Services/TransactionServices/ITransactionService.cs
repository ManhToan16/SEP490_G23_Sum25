using SEP490_BE.DTO.TransactionDTO;
using SEP490_BE.DTO;

namespace SEP490_BE.Services.TransactionServices
{
    public interface ITransactionService
    {
        Task<TransactionResponseDTO> CreateImportTransaction(ImportMaterialDTO importDto,string userId);
        Task<TransactionResponseDTO> CreateProvideTransaction(ProvideMaterialDTO provideDto, string userId);
        Task<TransactionResponseDTO> RequestReturnTransaction(string transactionId, int quantity, string userId, string reason);
        Task<TransactionResponseDTO> ApproveReturnTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> RejectReturnTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> GetTransactionById(string id);
        Task<Pagination<TransactionResponseDTO>> GetAllTransactions(string? materialId, string? transactionType, string? status, int pageNumber = 1, int pageSize = 10);
    }
}
