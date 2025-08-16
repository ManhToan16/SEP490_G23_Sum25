namespace SEP490_BE.DTO.AuthDTO
{
    public class AuditLogDTO
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public string? UserName { get; set; }
        public string? Action { get; set; }
        public string TableName { get; set; } = null!;
        public string RecordId { get; set; } = null!;
        public string? OldData { get; set; }
        public string? NewData { get; set; }
        public DateTime? ActionTime { get; set; }
    }
}
