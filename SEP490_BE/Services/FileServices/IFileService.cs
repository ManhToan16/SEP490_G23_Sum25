namespace SEP490_BE.Services.FileServices
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string relativePath);
        Task DeleteFileAsync(string relativePath);
        bool FileExists(string relativePath);
    }

}
