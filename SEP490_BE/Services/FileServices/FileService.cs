namespace SEP490_BE.Services.FileServices
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _env;

        public FileService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string relativePath)
        {
            if (file == null)
                throw new ArgumentNullException(nameof(file));
            if (string.IsNullOrWhiteSpace(relativePath))
                throw new ArgumentNullException(nameof(relativePath));

            const long MaxFileSize = 20 * 1024 * 1024; // 20MB
            var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".dcm", ".xlsx" };

            if (file.Length > MaxFileSize)
                throw new Exception("Kích thước tệp vượt quá giới hạn cho phép 20MB.");

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                throw new Exception("Tệp không hợp lệ. Vui lòng chọn tệp có đuôi [.pdf, .jpg, .jpeg, .png, .dcm, .xlsx].");

            // Đảm bảo WebRootPath tồn tại
            if (string.IsNullOrEmpty(_env.WebRootPath))
            {
                _env.WebRootPath = Path.Combine(_env.ContentRootPath, "wwwroot");
            }

            var fullPath = Path.Combine(_env.WebRootPath, relativePath);
            var directory = Path.GetDirectoryName(fullPath)!;
            
            // Tạo thư mục nếu chưa tồn tại
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            var fileName = Guid.NewGuid().ToString() + ext;
            var savedPath = Path.Combine(directory, fileName);

            using (var stream = new FileStream(savedPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = Path.Combine(relativePath, fileName).Replace("\\", "/");
            return "/" + fileUrl.TrimStart('/');
        }


        public async Task DeleteFileAsync(string relativePath)
        {
            var fullPath = Path.Combine(_env.WebRootPath, relativePath.TrimStart('/'));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                await Task.CompletedTask;
            }
        }

        public bool FileExists(string relativePath)
        {
            var fullPath = Path.Combine(_env.WebRootPath, relativePath.TrimStart('/'));
            return File.Exists(fullPath);
        }
    }

}
