using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.ExaminationResultDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.ExaminationResultServices;

namespace SEP490_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExaminationResultController : ControllerBase
    {
        private readonly IExaminationResultService _service;

        public ExaminationResultController(IExaminationResultService service)
        {
            _service = service;
        }

        [Authorize(Roles = RoleConstants.Doctor)]
        [HttpPost("visit/{visitId}")]
        public async Task<ActionResult<ApiResponse>> Create(string visitId, [FromBody] ExaminationResultRequestDTO request)
        {
            var result = await _service.CreateByVisitId(visitId, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Doctor)]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse>> Update(string id, [FromBody] ExaminationResultRequestDTO request)
        {
            var result = await _service.Update(id, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize]
        [HttpGet("medical-record/{medicalRecordId}")]
        public async Task<ActionResult<ApiResponse>> GetByMedicalRecordId(string medicalRecordId)
        {
            var results = await _service.GetByMedicalRecordId(medicalRecordId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = results
            });
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse>> GetById(string id)
        {
            var result = await _service.GetById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [AllowAnonymous] 
        [HttpGet("access-code/{accessCode}")]
        public async Task<ActionResult<ApiResponse>> FindByAccessCode(string accessCode)
        {
            var result = await _service.FindByAccessCode(accessCode);
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
