using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.MedicalRecordDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.MedicalRecordServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalRecordController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalRecordService;

        public MedicalRecordController(IMedicalRecordService medicalRecordService)
        {
            _medicalRecordService = medicalRecordService;
        }

        [Authorize]
        [HttpPost("patient-profile/{patientProfileId}")]
        public async Task<ActionResult<ApiResponse>> Create(string patientProfileId, [FromBody] MedicalRecordRequestDTO request)
        {
            var result = await _medicalRecordService.Create(patientProfileId, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize]
        [HttpPut("{medicalRecordId}")]
        public async Task<ActionResult<ApiResponse>> Update(string medicalRecordId, [FromBody] MedicalRecordRequestDTO request)
        {
            var result = await _medicalRecordService.Update(medicalRecordId, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize]
        [HttpGet("patient-profile/{patientProfileId}")]
        public async Task<ActionResult<ApiResponse>> GetByPatientProfileId(string patientProfileId)
        {
            var result = await _medicalRecordService.FindByPatientProfileId(patientProfileId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize]
        [HttpGet("{medicalRecordId}")]
        public async Task<ActionResult<ApiResponse>> GetById(string medicalRecordId)
        {
            var result = await _medicalRecordService.GetById(medicalRecordId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }
    }

}
