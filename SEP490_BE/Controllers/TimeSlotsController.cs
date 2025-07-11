using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.Hubs;
using SEP490_BE.Services.SupplierServices;
using SEP490_BE.Services.TimeSlotServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeSlotsController : ControllerBase
    {
        private readonly ITimeSlotService _timeSlotService;
        private readonly IHubContext<KhanhAnHub> _hubContext;

        public TimeSlotsController(ITimeSlotService timeSlotService, IHubContext<KhanhAnHub> hubContext)
        {
            _timeSlotService = timeSlotService;
            _hubContext = hubContext;
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTimeSlotById(string id)
        {
            var timeSlot = await _timeSlotService.GetTimeSlotById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { timeSlot }
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTimeSlots()
        {
            var timeSlots = await _timeSlotService.GetAllTimeSlots();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = timeSlots
            });
        }
    }
}
