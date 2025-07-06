using Microsoft.AspNetCore.Mvc;

namespace SEP490_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
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
    }
} 