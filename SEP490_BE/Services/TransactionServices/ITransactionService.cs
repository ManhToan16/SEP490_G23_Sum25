using SEP490_BE.DTO.TransactionDTO;
using SEP490_BE.DTO;

namespace SEP490_BE.Services.TransactionServices
{
    public interface ITransactionService
    {
        Task<TransactionResponseDTO> CreateImportTransaction(ImportMaterialDTO importDto,string userId);
        Task<List<TransactionResponseDTO>> CreateProvideTransaction(ProvideMaterialDTO provideDto, string userId);
        Task<TransactionResponseDTO> RequestReturnTransaction(NurseReturnDTO returnDto, string userId);
        Task<TransactionResponseDTO> ApproveReturnTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> RejectReturnTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> RequestAdminReturnTransaction(AdminReturnDTO returnDto, string adminId);
        Task<TransactionResponseDTO> ApproveAdminReturnTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> RejectAdminReturnTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> GetTransactionById(string id);
        Task<List<TransactionResponseDTO>> GetAllTransactions(string? materialId, string? transactionType, string? status);
        Task<List<ProvidedSummaryDTO>> GetTotalProvidedByRoomType(string roomType);
        Task<List<ProvidedSummaryDTO>> GetTotalProvidedByRoomId(string userId);
        Task<List<ProvidedSummaryDTO>> GetHistoryProvidedByRoomId(string userId);
        Task UseMaterialAsync(UseMaterialDTO useDto, string userId);
        Task<TransactionResponseDTO> ApproveProvideTransaction(string transactionId, string adminId);
        Task<TransactionResponseDTO> RejectProvideTransaction(string transactionId, string adminId);
        Task<List<TransactionResponseDTO>> GetDefectiveBatches();
        Task<List<TransactionHistoryDTO>> GetTransactionHistories(string? transactionId = null);
        Task<List<ProvidedSummaryDTO>> GetTotalProvidedForAllRooms(string? materialName = null);
        Task<List<ProvideHistoryDTO>> GetProvideHistoryAsync(string? materialName, string? roomName);
        Task<TransactionResponseDTO> UpdateDefectiveQuantityAsync(string transactionId, int newDefectiveQuantity, string updatedBy);
        Task<List<TransactionResponseDTO>> GetImportHistoryByMaterialIdAsync(string materialId);
        Task<List<TransactionResponseDTO>> GetImporToProvide(string materialId);
        Task<TransactionResponseDTO> UpdateImportTransactionAsync(string transactionId, ImportMaterialDTO updateDto, string userId);
        Task DeleteImportTransactionAsync(string transactionId, string userId);
        Task<List<TransactionResponseDTO>> GetPendingProvideTransactionsForNurseAsync(string nurseId);
        Task<List<MaterialUsageHistoryDTO>> GetMaterialUsageHistoryAsync(string nurseId, DateTime? fromDate, DateTime? toDate);
        Task<List<ApproveRejectHistoryDTO>> GetApproveRejectHistoryAsync(string userId, DateTime? fromDate, DateTime? toDate);
    }
}
