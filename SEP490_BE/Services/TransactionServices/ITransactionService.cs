using SEP490_BE.DTO.TransactionDTO;
using SEP490_BE.DTO;

namespace SEP490_BE.Services.TransactionServices
{
    public interface ITransactionService
    {
        Task<TransactionResponseDTO> CreateImportTransaction(ImportMaterialDTO importDto,string userId);
        Task<TransactionResponseDTO> CreateProvideTransaction(ProvideMaterialDTO provideDto, string userId);
        Task<TransactionResponseDTO> RequestReturnTransaction(NurseReturnDTO returnDto, string userId);
        Task<TransactionResponseDTO> ApproveReturnTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> RejectReturnTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> RequestAdminReturnTransaction(AdminReturnDTO returnDto, string adminId);
        Task<TransactionResponseDTO> ApproveAdminReturnTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> RejectAdminReturnTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> GetTransactionById(string id);
        Task<Pagination<TransactionResponseDTO>> GetAllTransactions(string? materialId, string? transactionType, string? status, int pageNumber = 1, int pageSize = 10);
        Task<List<ProvidedSummaryDTO>> GetTotalProvidedByRoomType(string roomType);
        Task<List<ProvidedSummaryDTO>> GetTotalProvidedByRoomId(string roomId);
        Task<TransactionResponseDTO> UseMaterial(UseMaterialDTO useDto, string userId);
        Task<TransactionResponseDTO> ApproveProvideTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> RejectProvideTransaction(string transactionId, string adminId);
        Task<Pagination<TransactionResponseDTO>> GetDefectiveBatches(int pageNumber = 1, int pageSize = 10);
        Task<List<TransactionHistoryDTO>> GetTransactionHistories(string? transactionId = null);
    }
}
