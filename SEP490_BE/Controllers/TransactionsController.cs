using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.TransactionDTO;
using SEP490_BE.Exceptions;
using SEP490_BE.Hubs;
using SEP490_BE.Services.TransactionServices;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly INotificationHubService _notificationHubService;

        public TransactionsController(ITransactionService transactionService, INotificationHubService notificationHubService)
        {
            _transactionService = transactionService;
            _notificationHubService = notificationHubService;
            
        }

        [HttpPost("import")]
        [Authorize(Roles = RoleConstants.Admin)]
        [SwaggerOperation(Summary = "Tạo phiếu nhập vật tư", Description = "API để tạo phiếu nhập vật tư từ nhà cung cấp")]
        public async Task<IActionResult> CreateImportTransaction([FromBody] ImportMaterialDTO importDto)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            if (string.IsNullOrEmpty(importDto.MaterialId) || string.IsNullOrEmpty(importDto.SupplierId))
            {
                return BadRequest(new ApiResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Success = false,
                    Message = "MaterialId và SupplierId là bắt buộc.",
                    Data = null
                });
            }

            var transaction = await _transactionService.CreateImportTransaction(importDto, userId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { transaction }
            });
        }

        [HttpPost("provide")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> CreateProvideTransaction([FromBody] ProvideMaterialDTO provideDto)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            if (string.IsNullOrEmpty(provideDto.MaterialId) || string.IsNullOrEmpty(provideDto.RoomId) )
            {
                return BadRequest(new ApiResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Success = false,
                    Message = "MaterialId và RoomId là bắt buộc.",
                    Data = null
                });
            }

            var transaction = await _transactionService.CreateProvideTransaction(provideDto,userId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { transaction }
            });
        }

        [HttpPost("return/nurse-request")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> RequestReturnTransaction([FromBody] NurseReturnDTO returnDto)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            if (string.IsNullOrEmpty(returnDto.TransactionId) || string.IsNullOrEmpty(returnDto.Reason))
            {
                return BadRequest(new ApiResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Success = false,
                    Message = "TransactionId và Reason là bắt buộc.",
                    Data = null
                });
            }

            var transaction = await _transactionService.RequestReturnTransaction(returnDto,userId);
            await _notificationHubService.SendTransactionUpdate(transaction);

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { transaction }
            });
        }
        [HttpPost("return/admin-request")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> RequestAdminReturnTransaction([FromBody] AdminReturnDTO returnDto)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            if (string.IsNullOrEmpty(returnDto.TransactionId) || string.IsNullOrEmpty(returnDto.Reason))
            {
                return BadRequest(new ApiResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Success = false,
                    Message = "TransactionId và Reason là bắt buộc.",
                    Data = null
                });
            }

            var transaction = await _transactionService.RequestAdminReturnTransaction(returnDto, userId);
            await _notificationHubService.SendTransactionUpdate(transaction);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { transaction }
            });
        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("return/approve-nurse-return/{transactionId}")]
        public async Task<IActionResult> ApproveReturnTransaction(string transactionId)
        {
            var adminId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            var transaction = await _transactionService.ApproveReturnTransaction(transactionId, adminId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { transaction }
            });
        }

        [HttpPut("return/reject-nurse-return/{transactionId}")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> RejectReturnTransaction(string transactionId)
        {
            var adminId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            var transaction = await _transactionService.RejectReturnTransaction(transactionId, adminId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { transaction }
            });
        }
        [HttpPut("return/approve-supplier-return/{transactionId}")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> ApproveAdminReturnTransaction(string transactionId)
        {
            var adminId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            var transaction = await _transactionService.ApproveAdminReturnTransaction(transactionId, adminId);
            await _notificationHubService.SendTransactionUpdate(transaction);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { transaction }
            });
        }

        [HttpPut("return/reject-supplier-return/{transactionId}")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> RejectAdminReturnTransaction(string transactionId)
        {
            var adminId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            var transaction = await _transactionService.RejectAdminReturnTransaction(transactionId, adminId);
            await _notificationHubService.SendTransactionUpdate(transaction);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { transaction }
            });
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTransactionById(string id)
        {
            var transaction = await _transactionService.GetTransactionById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { transaction }
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTransactions([FromQuery] string? materialId = null, [FromQuery] string? transactionType = null, [FromQuery] string? status = null)
        {
            var pagination = await _transactionService.GetAllTransactions(materialId, transactionType, status);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = pagination 
            });
        }
        [HttpGet("total-by-room-type")]
        public async Task<IActionResult> GetTotalProvidedByRoomType([FromQuery] string roomType)
        {
            
                var summary = await _transactionService.GetTotalProvidedByRoomType(roomType);
                foreach (var item in summary.Where(s => s.IsLowStock))
                {
                    await _notificationHubService.SendLowStockAlert(item);
                }
                return Ok(new ApiResponse
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = MessageConstants.GET_SUCCESS,
                    Data = summary
                });
            
           
        }

        [HttpGet("total-by-room-id")]
        public async Task<IActionResult> GetTotalProvidedByRoomId([FromQuery] string roomId)
        {
           
                var summary = await _transactionService.GetTotalProvidedByRoomId(roomId);
                foreach (var item in summary.Where(s => s.IsLowStock))
                {
                    await _notificationHubService.SendLowStockAlert(item);
                }
                return Ok(new ApiResponse
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = MessageConstants.GET_SUCCESS,
                    Data = summary
                });
           
        }
        [HttpGet("totalAllRooms")]
        public async Task<IActionResult> GetTotalProvidedAllRooms()
        {

            var summary = await _transactionService.GetTotalProvidedForAllRooms();
            foreach (var item in summary.Where(s => s.IsLowStock))
            {
                await _notificationHubService.SendLowStockAlert(item);
            }
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = summary
            });

        }
        [HttpPost("use")]
        [Authorize(Roles = RoleConstants.Nurse)]
        public async Task<IActionResult> UseMaterial([FromBody] UseMaterialDTO useDto)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;


            if (string.IsNullOrEmpty(useDto.MaterialId) || string.IsNullOrEmpty(useDto.RoomId) || useDto.Quantity <= 0)
            {
                return BadRequest(new ApiResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Success = false,
                    Message = "MaterialId, RoomId và Quantity hợp lệ là bắt buộc.",
                    Data = null
                });
            }

            var transaction = await _transactionService.UseMaterial(useDto, userId);
            await _notificationHubService.SendTransactionUpdate(transaction);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { transaction }
            });
        }
        [HttpPut("provide/approve/{transactionId}")]
        [Authorize(Roles =RoleConstants.Admin + "," + RoleConstants.Nurse)]
        public async Task<IActionResult> ApproveProvideTransaction(string transactionId)
        {
            var adminId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            var transaction = await _transactionService.ApproveProvideTransaction(transactionId, adminId);
            await _notificationHubService.SendTransactionUpdate(transaction);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { transaction }
            });
        }

        [HttpPut("provide/reject/{transactionId}")]
        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Nurse)]
        public async Task<IActionResult> RejectProvideTransaction(string transactionId)
        {
            var adminId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            var transaction = await _transactionService.RejectProvideTransaction(transactionId, adminId);
            await _notificationHubService.SendTransactionUpdate(transaction);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { transaction }
            });
        }
        [HttpGet("defective-batches")]
        public async Task<IActionResult> GetDefectiveBatches()
        {
            var items = await _transactionService.GetDefectiveBatches();

            if (items.Any())
            {
                await _notificationHubService.SendTransactionUpdate(items.First()); // Gửi thông báo cho lô đầu tiên
            }

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = items
            });
        }

        [HttpGet("histories")]
        public async Task<IActionResult> GetTransactionHistories([FromQuery] string? transactionId = null)
        {
            var histories = await _transactionService.GetTransactionHistories(transactionId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = histories
            });
        }

    }
}
