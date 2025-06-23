namespace SEP490_BE.DTO
{
    public class ApiResponse
    {
        public int StatusCode { get; set; }
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
        public Object Data { get; set; } = default!;
    }
}
