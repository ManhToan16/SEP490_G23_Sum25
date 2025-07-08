using SEP490_BE.DTO;
using SEP490_BE.DTO.UserDTO;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.AuditLogRepositories;
using StackExchange.Redis;
using System.Xml.Linq;

namespace SEP490_BE.Services.AuditLogServices
{
    public class AuditLogService : IAuditLogService
    {
        IAuditLogRepository _repository;
        public AuditLogService(IAuditLogRepository repository) {
            _repository = repository;
        }

        public async Task<Pagination<AuditLog>> GetLogsAsync(string? userId, string? action, string? tableName, int pageNumber, int pageSize)
        {
            var (logs, totalItems) = await _repository.GetLogsAsync(userId, action, tableName, pageNumber, pageSize);
            return new Pagination<AuditLog>
            {
                Items = logs,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
    }
}
