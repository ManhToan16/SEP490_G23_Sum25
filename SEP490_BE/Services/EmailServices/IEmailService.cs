namespace SEP490_BE.Services.EmailServices
{
    public interface IEmailService
    {
        Task SendAsync(string toEmail, string subject, string htmlMessage);
    }
}
