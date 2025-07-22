using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.PrescriptionDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.PrescriptionServices;

namespace SEP490_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrescriptionController : ControllerBase
    {
        private readonly IPrescriptionService _service;

        public PrescriptionController(IPrescriptionService service)
        {
            _service = service;
        }

        [Authorize(Roles = RoleConstants.Doctor)]
        [HttpPost("examination-result/{examinationResultId}")]
        public async Task<ActionResult<ApiResponse>> Create(string examinationResultId, [FromBody] PrescriptionRequestDTO request)
        {
            var result = await _service.CreateAsync(examinationResultId, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { result }
            });
        }

        [HttpGet("examination-result/{examinationResultId}")]
        public async Task<ActionResult<ApiResponse>> GetByExaminationResultId(string examinationResultId)
        {
            var result = await _service.GetByExaminationResultIdAsync(examinationResultId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Doctor)]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse>> Update(string id, [FromBody] PrescriptionRequestDTO request)
        {
            var result = await _service.UpdateAsync(id, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Doctor)]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse>> Delete(string id)
        {
            await _service.DeleteAsync(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS
            });
        }

    }

}
