using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SEP490_BE.Constants;
using SEP490_BE.DTO.MedicineDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.MedicineServices;
using SEP490_BE.Hubs;
using SEP490_BE.Entities;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicinesController : ControllerBase
    {
        private readonly IMedicineService _medicineService;
        private readonly INotificationHubService _notificationHubService;

        public MedicinesController(IMedicineService medicineService, INotificationHubService notificationHubService)
        {
            _medicineService = medicineService;
            _notificationHubService = notificationHubService;
        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPost]
        public async Task<IActionResult> CreateMedicine([FromBody] CreateMedicineDTO request)
        {          
            var medicine = await _medicineService.CreateMedicine(request);
            await _notificationHubService.SendMedicineUpdate(medicine);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { medicine }
            });
        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMedicine(string id, [FromBody] UpdateMedicineDTO request)
        {
     
            var medicine = await _medicineService.UpdateMedicine(id, request);
            await _notificationHubService.SendMedicineUpdate(medicine);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { medicine }
            });
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicine(string id)
        {     
            await _medicineService.DeleteMedicine(id);
            await _notificationHubService.SendMedicineDelete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMedicineById(string id)
        {
            var medicine = await _medicineService.GetMedicineById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { medicine }
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMedicine([FromQuery] string? name = null, [FromQuery] string? description = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pagination = await _medicineService.GetAllMedicine(name, description, pageNumber, pageSize);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { pagination }
            });
        }
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveMedicines()
        {
            var result = await _medicineService.GetActiveMedicinesAsync();
            return Ok(new
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = result 
            });
        }

    }
}
