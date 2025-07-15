using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.VisitDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.AssignmentServices;
using SEP490_BE.DTO.AssignmentDTO;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssignmentController : ControllerBase
    {
        private readonly IAssignmentService _assignmentService;

        public AssignmentController(IAssignmentService assignmentService) {
            _assignmentService = assignmentService;
        }

        [Authorize(Roles = RoleConstants.Doctor)]
        [HttpPost("visit/{visitId}")]
        public async Task<ActionResult<ApiResponse>> CreateRange(string visitId, [FromBody] List<AssignmentRequestDTO> requests)
        {
            var result = await _assignmentService.CreateRange(visitId, requests);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = result
            });
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse>> GetById(string id)
        {
            var result = await _assignmentService.GetById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Technician)]
        [HttpPut("{id}/mark-as-completed")]
        public async Task<ActionResult<ApiResponse>> MarkAsCompleted(string id)
        {
            var result = await _assignmentService.MarkAsCompleted(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Nurse)]
        [HttpPut("{id}/calling")]
        public async Task<ActionResult<ApiResponse>> Cancel(string id)
        {
            var result = await _assignmentService.Calling(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetAssignmentsByRoomAndDate(
           [FromQuery] string laboratoryRoomId,
           [FromQuery] string? status,
           [FromQuery] DateTime date,
           [FromQuery] int pageNumber = 1,
           [FromQuery] int pageSize = 10)
        {
            var result = await _assignmentService.GetAssignments(laboratoryRoomId, status, date, pageNumber, pageSize);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize]
        [HttpGet("visitId/{visitId}")]
        public async Task<ActionResult<ApiResponse>> GetByVisitId(string visitId)
        {
            var result = await _assignmentService.GetByVisitId(visitId);
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
