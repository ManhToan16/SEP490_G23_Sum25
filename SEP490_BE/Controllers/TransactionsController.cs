using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.TransactionDTO;
using SEP490_BE.Services.TransactionServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;          
        }

        [HttpPost("import")]
        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Doctor)]
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
        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Doctor)]
        public async Task<IActionResult> CreateProvideTransaction([FromQuery] string materialId, [FromQuery] int quantity, [FromQuery] string roomId, [FromQuery] string roomType, [FromQuery] string? reason = null)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            if (string.IsNullOrEmpty(materialId) || string.IsNullOrEmpty(roomId) || string.IsNullOrEmpty(roomType))
            {
                return BadRequest(new ApiResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Success = false,
                    Message = "MaterialId, RoomId, và RoomType là bắt buộc.",
                    Data = null
                });
            }

            var transaction = await _transactionService.CreateProvideTransaction(materialId, quantity, userId, roomId, roomType, reason);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { transaction }
            });
        }

        [HttpPost("return/request")]
        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Doctor)]
        public async Task<IActionResult> RequestReturnTransaction([FromQuery] string transactionId, [FromQuery] int quantity, [FromQuery] string reason)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            if (string.IsNullOrEmpty(transactionId) || string.IsNullOrEmpty(reason))
            {
                return BadRequest(new ApiResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Success = false,
                    Message = "TransactionId và Reason là bắt buộc.",
                    Data = null
                });
            }

            var transaction = await _transactionService.RequestReturnTransaction(transactionId, quantity, userId, reason);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { transaction }
            });
        }

        [HttpPut("return/approve/{transactionId}")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> ApproveReturnTransaction(string transactionId)
        {
            var adminId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return Unauthorized(new ApiResponse
                {
                    StatusCode = StatusCodes.Status401Unauthorized,
                    Success = false,
                    Message = "Không tìm thấy UserId trong token.",
                    Data = null
                });
            }

            var transaction = await _transactionService.ApproveReturnTransaction(transactionId, adminId);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { transaction }
            });
        }

        [HttpPut("return/reject/{transactionId}")]
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
        public async Task<IActionResult> GetAllTransactions([FromQuery] string? materialId = null, [FromQuery] string? transactionType = null, [FromQuery] string? status = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pagination = await _transactionService.GetAllTransactions(materialId, transactionType, status, pageNumber, pageSize);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { pagination }
            });
        }
    }
}
