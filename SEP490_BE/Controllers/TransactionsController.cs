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
            if (string.IsNullOrEmpty(importDto.MaterialId) )
            {
                return BadRequest(new ApiResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Success = false,
                    Message = "MaterialId là bắt buộc.",
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
        [SwaggerOperation(
    Summary = "Tạo phiếu cấp phát vật tư",
    Description = "Admin cấp phát vật tư cho phòng khám hoặc phòng xét nghiệm (PROVIDE transaction)"
)]
        public async Task<IActionResult> CreateProvideTransaction([FromBody] ProvideMaterialDTO provideDto)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

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
        [SwaggerOperation(
    Summary = "Yêu cầu điều dưỡng trả vật tư",
    Description = "Điều dưỡng gửi yêu cầu trả vật tư về kho (NURSE_RETURN request)"
)]
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
        [SwaggerOperation(
    Summary = "Yêu cầu nhà cung cấp nhận lại vật tư lỗi",
    Description = "Admin tạo yêu cầu trả vật tư lỗi về nhà cung cấp (SUPPLIER_RETURN request)"
)]
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
        [SwaggerOperation(
    Summary = "Duyệt yêu cầu trả vật tư của điều dưỡng",
    Description = "Admin phê duyệt yêu cầu điều dưỡng trả vật tư (Approve NURSE_RETURN)"
)]
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
        [SwaggerOperation(
    Summary = "Từ chối yêu cầu trả vật tư của điều dưỡng",
    Description = "Admin từ chối yêu cầu trả vật tư của điều dưỡng"
)]
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
        [SwaggerOperation(
    Summary = "Duyệt yêu cầu trả vật tư về nhà cung cấp",
    Description = "Admin duyệt yêu cầu trả vật tư lỗi về nhà cung cấp"
)]
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
            [SwaggerOperation(
    Summary = "Từ chối yêu cầu trả vật tư về nhà cung cấp",
    Description = "Admin từ chối yêu cầu trả vật tư lỗi về nhà cung cấp"
)]
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
        [SwaggerOperation(
    Summary = "Tổng cấp phát theo loại phòng",
    Description = "Thống kê tổng số vật tư đã cấp phát (PROVIDE) theo loại phòng (EXAMINATION / LABORATORY)"
)]
        public async Task<IActionResult> GetTotalProvidedByRoomType([FromQuery] string roomType)
        {
            
                var summary = await _transactionService.GetTotalProvidedByRoomType(roomType);
                foreach (var item in summary.Where(s => s.IsLowStock ==true))
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
        [SwaggerOperation(
    Summary = "Tổng cấp phát theo mã phòng",
    Description = "Thống kê tổng số vật tư đã cấp phát theo một phòng cụ thể"
)]
        public async Task<IActionResult> GetTotalProvidedByRoomId([FromQuery] string roomId)
        {
           
                var summary = await _transactionService.GetTotalProvidedByRoomId(roomId);
                foreach (var item in summary.Where(s => s.IsLowStock==true))
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
        [SwaggerOperation(
    Summary = "Tổng cấp phát tất cả các phòng",
    Description = "Thống kê tổng số vật tư đã cấp phát cho tất cả các phòng"
)]
        public async Task<IActionResult> GetTotalProvidedAllRooms([FromQuery] string? materialName = null)
        {

            var summary = await _transactionService.GetTotalProvidedForAllRooms(materialName);
            foreach (var item in summary.Where(s => s.IsLowStock == true))
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
        [SwaggerOperation(
    Summary = "Điều dưỡng sử dụng vật tư",
    Description = "Nurse sử dụng vật tư trong phòng khám/xét nghiệm"
)]
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
        [SwaggerOperation(
    Summary = "Lô hàng lỗi",
    Description = "Lấy danh sách các giao dịch nhập vật tư có số lượng lỗi (>0)"
)]
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
        [SwaggerOperation(
    Summary = "Lịch sử giao dịch",
    Description = "Lấy lịch sử xử lý của một giao dịch (approve/reject)"
)]
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

        [HttpGet("provide-histories")]
        [SwaggerOperation(
          Summary = "Lịch sử giao dịch phân phát",
          Description = "Lấy lịch sử phân phát, có thể lọc theo MaterialName và TransactionType"
      )]
        public async Task<IActionResult> GetProvideHistories([FromQuery] string? materialName, [FromQuery] string? roomName)
        {
            var histories = await _transactionService.GetProvideHistoryAsync(materialName, roomName);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = histories
            });
        }

        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("update-defective/{transactionId}")]
        
        [SwaggerOperation(
    Summary = "Cập nhật số lượng hàng lỗi",
    Description = "Chỉ áp dụng cho giao dịch nhập hàng (IMPORT). Nếu tăng số lượng lỗi thì sẽ giảm số lượng có thể sử dụng và cập nhật tồn kho."
)]
        public async Task<IActionResult> UpdateDefectiveQuantity(string transactionId, [FromBody] UpdateDefectiveQuantityDTO request)
        {
            if (request.NewDefectiveQuantity < 0)
            {
                return BadRequest(new ApiResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Success = false,
                    Message = "Số lượng lỗi không hợp lệ."
                });
            }
            var updatedBy = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            var result = await _transactionService.UpdateDefectiveQuantityAsync(transactionId, request.NewDefectiveQuantity, updatedBy);

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = result
            });
        }
        [HttpGet("import-history/{materialId}")]
        [SwaggerOperation(
    Summary = "Lấy lịch sử nhập hàng của một vật tư",
    Description = "Hiển thị tất cả các transaction có TransactionType = 'IMPORT' cho Material ID cụ thể"
)]
        public async Task<IActionResult> GetImportHistory(string materialId)
        {
            var transactions = await _transactionService.GetImportHistoryByMaterialIdAsync(materialId);

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = transactions
            });
        }
        [HttpGet("import-to-provide/{materialId}")]
        [SwaggerOperation(
Summary = "Lấy lịch sử nhập hàng của một vật tư để phân phát",
Description = "Hiển thị tất cả các transaction có TransactionType = 'IMPORT' cho Material ID cụ thể để phân phát"
)]
        public async Task<IActionResult> GetImportToProvide(string materialId)
        {
            var transactions = await _transactionService.GetImporToProvide(materialId);

            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = transactions
            });
        }
    }
}
