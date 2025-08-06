using SEP490_BE.DTO.UserDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.DTO.AuthDTO;

namespace SEP490_BE.Services.AuditLogServices
{
    public interface IAuditLogService
    {
        Task<Pagination<AuditLogDTO>> GetLogsAsync(string? userId, string? action, string? tableName, string? recordId, int pageNumber, int pageSize);
    }
}
