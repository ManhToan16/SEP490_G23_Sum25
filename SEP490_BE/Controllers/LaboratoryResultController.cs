using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.LaboratoryResultDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.LaboratoryResultServices;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;

namespace SEP490_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LaboratoryResultController : ControllerBase
    {
        private readonly ILaboratoryResultService _service;

        public LaboratoryResultController(ILaboratoryResultService service)
        {
            _service = service;
        }

        [Authorize(Roles = RoleConstants.Technician)]
        [HttpPost("assignment/{assignmentId}")]
        public async Task<ActionResult<ApiResponse>> Create(string assignmentId, [FromBody] LaboratoryResultRequestDTO request)
        {
            var result = await _service.CreateByAssignmentId(assignmentId, request);
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
            var results = await _service.GetListByExaminationId(examinationResultId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = results
            });
        }

        [HttpGet("assignment/{assignmentId}")]
        public async Task<ActionResult<ApiResponse>> GetByAssignmentId(string assignmentId)
        {
            var result = await _service.GetByAssignmentId(assignmentId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

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

        [Authorize(Roles = RoleConstants.Technician)]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse>> Update(string id, [FromBody] LaboratoryResultRequestDTO request)
        {
            var result = await _service.UpdateById(id, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Technician)]
        [Consumes("multipart/form-data")]
        [HttpPost("{laboratoryResultId}/upload-files")]
        public async Task<ActionResult<ApiResponse>> UploadFiles(string laboratoryResultId, [FromForm] List<IFormFile> files)
        {
            var result = await _service.UploadFiles(laboratoryResultId, files);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.UPLOAD_SUCCESS,
                Data = result
            });
        }


        [Authorize(Roles = RoleConstants.Technician)]
        [HttpDelete("delete-file/{fileId}")]
        public async Task<ActionResult<ApiResponse>> DeleteFile(string fileId)
        {
            await _service.DeleteFileById(fileId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS
            });
        }
    }

}
