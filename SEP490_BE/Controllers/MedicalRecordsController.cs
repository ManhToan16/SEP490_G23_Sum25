using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.Services.MedicalRecordServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalRecordService;

        public MedicalRecordsController(IMedicalRecordService medicalRecordService)
        {
            _medicalRecordService = medicalRecordService;
        }
        
        [Authorize(Roles = RoleConstants.Doctor + "," + RoleConstants.Admin)]
        [Consumes("multipart/form-data")]
        [HttpPost("{medicalRecordId}/upload-document")]
        public async Task<ActionResult<ApiResponse>> UploadDocument(string medicalRecordId, [FromForm] IFormFile file)
        {
            var result = await _medicalRecordService.UploadMedicalRecord(medicalRecordId, file);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.UPLOAD_SUCCESS,
                Data = new[] { new { url = result } }
            });
        }
    }
} 