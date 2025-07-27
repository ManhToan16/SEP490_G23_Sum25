using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.AuditLogRepositories
{
    public interface IAuditLogRepository
    {
        Task LogAsync(string userId, string action, string tableName, string recordId, object? oldData, object? newData);
        Task<(List<AuditLog>, int)> GetLogsAsync(string? userId, string? action, string? tableName, string? recordId, int pageNumber, int pageSize);
    }
}
