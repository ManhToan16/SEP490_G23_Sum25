using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.AuditLogRepositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public AuditLogRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task LogAsync(string userId, string action, string tableName, string recordId, object? oldData, object? newData)
        {
            var log = new AuditLog
            {
                UserId = userId,
                Action = action,
                TableName = tableName,
                RecordId = recordId,
                OldData = oldData != null ? System.Text.Json.JsonSerializer.Serialize(oldData) : null,
                NewData = newData != null ? System.Text.Json.JsonSerializer.Serialize(newData) : null,
                ActionTime = DateTime.Now
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<(List<AuditLog>, int)> GetLogsAsync(string? userId, string? action, string? tableName, int pageNumber, int pageSize)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(userId))
                query = query.Where(x => x.UserId == userId);

            if (!string.IsNullOrWhiteSpace(action))
                query = query.Where(x => x.Action == action);

            if (!string.IsNullOrWhiteSpace(tableName))
                query = query.Where(x => x.TableName == tableName);

            var totalItems = await query.CountAsync();

            var logs = await query.OrderByDescending(x => x.ActionTime)
                                  .Skip((pageNumber - 1) * pageSize)
                                  .Take(pageSize)
                                  .ToListAsync();

            return (logs, totalItems);
        }
    }
}
