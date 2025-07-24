using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Services.FileServices;

namespace SEP490_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly IFileService _fileService;

        public HealthController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "Khanh An Neurology Clinic API",
                version = "1.0.0"
            });
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "Khanh An Neurology Clinic API",
                version = "1.0.0"
            });
        }

        [HttpGet("static-files")]
        public IActionResult CheckStaticFiles()
        {
            var testPath = "uploads/doctorProfile";
            var exists = _fileService.FileExists(testPath);
            
            return Ok(new
            {
                staticFilesStatus = exists ? "available" : "not_available",
                testPath = testPath,
                timestamp = DateTime.UtcNow
            });
        }
    }
} 