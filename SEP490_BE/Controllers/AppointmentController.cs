using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.AppointmentDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.AppointmentServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> Create([FromBody] AppointmentRequestDTO request)
        {
            var result = await _appointmentService.Create(request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = result
            });
        }

        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Receptionist + "," + RoleConstants.Doctor)]
        [HttpPost("created-by-clinic")]
        public async Task<ActionResult<ApiResponse>> CreatedByClinic([FromBody] AppointmentRequestDTO request)
        {
            var result = await _appointmentService.CreatedByClinic(request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = result
            });
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetAll(
            [FromQuery] string? name,
            [FromQuery] string? email,
            [FromQuery] string? phoneNumber,
            [FromQuery] DateTime? dob,
            [FromQuery] DateTime? date,
            [FromQuery] string? status,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _appointmentService.GetAll
                (name, email, phoneNumber, dob, date, status, pageNumber, pageSize);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse>> GetById(string id)
        {
            var result = await _appointmentService.GetById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Receptionist)]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse>> Update(string id, [FromBody] AppointmentRequestDTO request)
        {
            var result = await _appointmentService.Update(id, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Receptionist)]
        [HttpPut("{id}/cancel")]
        public async Task<ActionResult<ApiResponse>> Cancel(string id, [FromBody] CancelAppointmentDTO request)
        {
            var result = await _appointmentService.Cancel(id, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Receptionist)]
        [HttpPut("{id}/confirm")]
        public async Task<ActionResult<ApiResponse>> Confirm(string id)
        {
            var result = await _appointmentService.Confirm(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Receptionist)]
        [HttpPut("{id}/check-in")]
        public async Task<ActionResult<ApiResponse>> CheckIn(string id)
        {
            var result = await _appointmentService.CheckIn(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Receptionist)]
        [HttpPut("{id}/mark-as-paid")]
        public async Task<ActionResult<ApiResponse>> MarkAsPaid(string id)
        {
            var result = await _appointmentService.MarkAsPaid(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { result }
            });
        }

        [HttpGet("{id}/invoice")]
        public async Task<IActionResult> PrintInvoice(string id)
        {
            var pdfBytes = await _appointmentService.GenerateInvoicePdf(id);
            return File(pdfBytes, "application/pdf", $"HoaDon_{id}.pdf");
        }

    }
}
