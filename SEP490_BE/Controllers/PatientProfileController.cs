using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.PatientProfileDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.PatientProfileServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientProfileController : ControllerBase
    {
        private readonly IPatientProfileService _patientProfileService;

        public PatientProfileController(IPatientProfileService patientProfileService)
        {
            _patientProfileService = patientProfileService;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetAll(
            [FromQuery] string? name,
            [FromQuery] DateTime? dateOfBirth,
            [FromQuery] string? citizenId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _patientProfileService.GetAll(name, dateOfBirth, citizenId, pageNumber, pageSize);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new [] { result }
            });
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse>> GetById(string id)
        {
            var result = await _patientProfileService.GetById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Receptionist)]
        [HttpPost]
        public async Task<ActionResult<ApiResponse>> Create([FromBody] PatientProfileRequestDTO request)
        {
            var result = await _patientProfileService.Create(request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Receptionist)]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse>> Update(string id, [FromBody] PatientProfileRequestDTO request)
        {
            var result = await _patientProfileService.Update(id, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }
    }
}
