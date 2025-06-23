namespace SEP490_BE.DTO
{
    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<FieldError>? Errors { get; set; }
    }
}
