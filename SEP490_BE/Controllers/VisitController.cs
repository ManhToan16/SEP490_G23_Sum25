using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.AppointmentDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.VisitServices;
using SEP490_BE.DTO.VisitDTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VisitController : ControllerBase
    {
        private readonly IVisitService _visitService;

        public VisitController(IVisitService visitService) { 
            _visitService = visitService;
        }

        [Authorize(Roles = RoleConstants.Receptionist)]
        [HttpPost]
        public async Task<ActionResult<ApiResponse>> Create([FromBody] VisitRequestDTO request)
        {
            var result = await _visitService.Create(request);
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
            var result = await _visitService.GetById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetVisitsByRoomAndDate(
           [FromQuery] string examinationRoomId,
           [FromQuery] string? status,
           [FromQuery] DateTime date,
           [FromQuery] int pageNumber = 1,
           [FromQuery] int pageSize = 10)
        {
            var result = await _visitService.GetVisits(examinationRoomId, status, date, pageNumber, pageSize);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Doctor)]
        [HttpPut("{id}/mark-as-completed")]
        public async Task<ActionResult<ApiResponse>> MarkAsCompleted(string id)
        {
            var result = await _visitService.MarkAsComplete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }
        
        [Authorize(Roles = RoleConstants.Doctor)]
        [HttpPut("{id}/mark-as-completed-without-assignment")]
        public async Task<ActionResult<ApiResponse>> MarkAsCompletedWithoutAssignment(string id)
        {
            var result = await _visitService.MarkAsCompleteWithoutAssignment(id);
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
            var result = await _visitService.Calling(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize]
        [HttpGet("appointment/{appointmentId}")]
        public async Task<ActionResult<ApiResponse>> GetByAppointmentId(string appointmentId)
        {
            var result = await _visitService.GetByAppointmentId(appointmentId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize]
        [HttpGet("patient-profile/{patientProfileId}")]
        public async Task<ActionResult<ApiResponse>> GetByPatientProfile(string patientProfileId)
        {
            var result = await _visitService.GetByPatientProfileId(patientProfileId);
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
