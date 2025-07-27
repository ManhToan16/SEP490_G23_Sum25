using SEP490_BE.DTO.UserDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Services.AuditLogServices
{
    public interface IAuditLogService
    {
        Task<Pagination<AuditLog>> GetLogsAsync(string? userId, string? action, string? tableName, string? recordId, int pageNumber, int pageSize);
    }
}
