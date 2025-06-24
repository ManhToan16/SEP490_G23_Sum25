using SEP490_BE.Constants;
using System.Net.Mail;
using System.Net;
using SEP490_BE.Entities;

namespace SEP490_BE.Services.EmailServices
{
    public class EmailService : IEmailService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IConfiguration _config;

        public EmailService(KhanhAnNeurologyClinicContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task SendAsync(string toEmail, string subject, string htmlMessage)
        {
            var smtpClient = new SmtpClient(_config["Smtp:Host"])
            {
                Port = int.Parse(_config["Smtp:Port"]),
                Credentials = new NetworkCredential(_config["Smtp:Email"], _config["Smtp:Password"]),
                EnableSsl = true,
            };

            var mail = new MailMessage
            {
                From = new MailAddress(_config["Smtp:Email"], "Khanh An Neurology Clinic"),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true,
            };

            mail.To.Add(toEmail);
            await smtpClient.SendMailAsync(mail);
        }
    }
}
