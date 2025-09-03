using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SEP490_BE.Constants;
using SEP490_BE.DTO.SupplierDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.SupplierServices;
using SEP490_BE.Hubs;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuppliersController : ControllerBase
    {
        private readonly ISupplierService _supplierService;
        private readonly INotificationHubService _notificationHubService;

        public SuppliersController(ISupplierService supplierService, INotificationHubService notificationHubService)
        {
            _supplierService = supplierService;
            _notificationHubService = notificationHubService;

        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPost]
        public async Task<IActionResult> CreateSupplier([FromBody] CreateSupplierDTO request)
        {
            var supplier = await _supplierService.CreateSupplier(request);
            await _notificationHubService.SendSupplierUpdate(supplier,"Create");
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { supplier }
            });
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSupplier(string id, [FromBody] UpdateSupplierDTO request)
        {
            var supplier = await _supplierService.UpdateSupplier(id, request);
            await _notificationHubService.SendSupplierUpdate(supplier,"Update");
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { supplier }
            });
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(string id)
        {
            await _supplierService.DeleteSupplier(id);
            await _notificationHubService.SendSupplierDelete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSupplierById(string id)
        {
            var supplier = await _supplierService.GetSupplierById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { supplier }
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSuppliers()
        {
            var suppliers = await _supplierService.GetAllSuppliers();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = suppliers
            });
        }
    }
}
