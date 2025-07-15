using SEP490_BE.DTO.TransactionDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.MaterialRepositories;
using SEP490_BE.Repositories.TransactionRepositories;
using Microsoft.EntityFrameworkCore;

namespace SEP490_BE.Services.TransactionServices
{
    public class TransactionService : ITransactionService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IMaterialRepository _materialRepository;

        public TransactionService(KhanhAnNeurologyClinicContext context, ITransactionRepository transactionRepository, IMaterialRepository materialRepository)
        {
            _context = context;
            _transactionRepository = transactionRepository;
            _materialRepository = materialRepository;
        }

        public async Task<TransactionResponseDTO> CreateImportTransaction(ImportMaterialDTO importDto, string userId)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || !user.UserRoles.Any(ur => ur.RoleName == "ADMIN"))
            {
                throw new UnauthorizedAccessException("Chỉ admin mới có quyền nhập hàng.");
            }

            var material = await _materialRepository.FindByIdAsync(importDto.MaterialId);
            if (material == null)
            {
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            }
            var supplier = await _context.Suppliers.FindAsync(importDto.SupplierId);
            if (supplier == null)
            {
                throw new ResourceNotFoundException("Nhà cung cấp không tồn tại.");
            }

            if (importDto.DefectiveQuantity >= importDto.Quantity)
            {
                throw new Exception("Số lượng lỗi không được vượt quá số lượng nhập.");
            }
            var effectiveQuantity = importDto.Quantity - importDto.DefectiveQuantity;
            var transaction = new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                MaterialId = importDto.MaterialId,
                TransactionType = "IMPORT",
                Quantity = effectiveQuantity,
                DefectiveQuantity= importDto.DefectiveQuantity,   
                UserId = userId,
                Reason = importDto.Reason,
                Status = "APPROVED",
                SupplierId = importDto.SupplierId,
                Price = importDto.Price,
                CreatedAt = importDto.ImportDate + importDto.ImportTime,
                UpdatedAt = importDto.ImportDate + importDto.ImportTime
            };


            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                await _transactionRepository.AddAsync(transaction);
                material.QuantityInStock += effectiveQuantity; // Tăng số lượng tồn kho
                await _materialRepository.UpdateAsync(material);
                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
            }
            catch
            {
                await transactionScope.RollbackAsync();
                throw;
            }
            return MapToResponseDTO(transaction);

        }

        public async Task<TransactionResponseDTO> CreateProvideTransaction(string materialId, int quantity, string userId, string roomId, string roomType, string? reason = null)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || !user.UserRoles.Any(ur => ur.RoleName == "ADMIN" ))
            {
                throw new UnauthorizedAccessException("Chỉ admin mới có quyền phân phát vật tư.");
            }

            var material = await _materialRepository.FindByIdAsync(materialId);
            if (material == null)
            {
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            }
            if (material.QuantityInStock < quantity)
            {
                throw new Exception("Số lượng tồn kho không đủ để phân phát.");
            }

            var transaction = new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                MaterialId = materialId,
                TransactionType = "PROVIDE",
                Quantity = quantity,
                RoomId = roomId,
                RoomType = roomType,
                UserId = userId,
                Reason = reason,
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow
            };

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                await _transactionRepository.AddAsync(transaction);
                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
            }
            catch (Exception ex)
            {
                await transactionScope.RollbackAsync();
                throw;
            }
            return MapToResponseDTO(transaction);

        }

        public async Task<TransactionResponseDTO> RequestReturnTransaction(string transactionId, int quantity, string userId, string reason)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || !user.UserRoles.Any(ur => ur.RoleName == "ADMIN"))
            {
                throw new UnauthorizedAccessException("Chỉ admin mới có quyền yêu cầu đổi trả.");
            }

            var transaction = await _transactionRepository.FindByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }
            if (transaction.Status != "APPROVED" || transaction.TransactionType != "PROVIDE")
            {
                throw new Exception("Chỉ giao dịch phân phát đã phê duyệt mới có thể đổi trả.");
            }
            if (quantity > transaction.Quantity)
            {
                throw new Exception("Số lượng đổi trả không được vượt quá số lượng giao dịch.");
            }

            transaction.Status = "PENDING";
            transaction.Reason = reason;
            transaction.Quantity = quantity;
            transaction.UpdatedAt = DateTime.UtcNow;

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                await _transactionRepository.UpdateAsync(transaction);
                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
            }
            catch
            {
                await transactionScope.RollbackAsync();
                throw;
            }
            return MapToResponseDTO(transaction);

        }

        public async Task<TransactionResponseDTO> ApproveReturnTransaction(string transactionId, string adminId)
        {
            var admin = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == adminId);
            if (admin == null || !admin.UserRoles.Any(ur => ur.RoleName == "ADMIN"))
            {
                throw new UnauthorizedAccessException("Chỉ admin mới có quyền phê duyệt đổi trả.");
            }

            var transaction = await _transactionRepository.FindByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }
            if (transaction.Status != "PENDING" || transaction.TransactionType != "PROVIDE")
            {
                throw new Exception("Giao dịch không thể phê duyệt đổi trả.");
            }

            var material = await _materialRepository.FindByIdAsync(transaction.MaterialId);
            if (material == null)
            {
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            }

            transaction.Status = "APPROVED";
            transaction.UpdatedAt = DateTime.UtcNow;
            material.QuantityInStock += transaction.Quantity; // Tăng lại số lượng tồn kho

            var history = new TransactionHistory
            {
                Id = Guid.NewGuid().ToString(),
                TransactionId = transactionId,
                OldQuantity = 0, // Giả định ban đầu
                NewQuantity = transaction.Quantity,
                OldReason = transaction.Reason ?? "",
                NewReason = "Đổi trả được phê duyệt",
                ChangedBy = adminId,
                ChangedAt = DateTime.UtcNow
            };

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                await _transactionRepository.UpdateAsync(transaction);
                await _materialRepository.UpdateAsync(material);
                await _transactionRepository.AddTransactionHistoryAsync(history);
                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
            }
            catch (Exception ex)
            {
                await transactionScope.RollbackAsync();
                throw;
            }
            return MapToResponseDTO(transaction);

        }

        public async Task<TransactionResponseDTO> RejectReturnTransaction(string transactionId, string adminId)
        {
            var admin = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == adminId);
            if (admin == null || !admin.UserRoles.Any(ur => ur.RoleName == "ADMIN"))
            {
                throw new UnauthorizedAccessException("Chỉ admin mới có quyền từ chối đổi trả.");
            }

            var transaction = await _transactionRepository.FindByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }
            if (transaction.Status != "PENDING" || transaction.TransactionType != "PROVIDE")
            {
                throw new Exception("Giao dịch không thể từ chối đổi trả.");
            }

            transaction.Status = "REJECTED";
            transaction.UpdatedAt = DateTime.UtcNow;

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                await _transactionRepository.UpdateAsync(transaction);
                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
            }
            catch 
            {
                await transactionScope.RollbackAsync();
                throw;
            }
            return MapToResponseDTO(transaction);

        }

        public async Task<TransactionResponseDTO> GetTransactionById(string id)
        {
            var transaction = await _transactionRepository.FindByIdAsync(id);
            if (transaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }

            return  MapToResponseDTO(transaction);
        }

        public async Task<Pagination<TransactionResponseDTO>> GetAllTransactions(string? materialId, string? transactionType, string? status, int pageNumber = 1, int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var (transactions, totalItems) = await _transactionRepository.FindAll(materialId, transactionType, status, pageNumber, pageSize);
            var responseDtos = transactions.Select(MapToResponseDTO).ToList();
            return new Pagination<TransactionResponseDTO>
            {
                Items = responseDtos,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        private TransactionResponseDTO MapToResponseDTO(Transaction transaction)
        {
            return new TransactionResponseDTO
            {
                Id = transaction.Id,
                MaterialId = transaction.MaterialId,
                MaterialName = transaction.Material?.Name,
                TransactionType = transaction.TransactionType,
                Quantity = transaction.Quantity,
                DefectiveQuantity = transaction.DefectiveQuantity,
                RoomId = transaction.RoomId,
                RoomType = transaction.RoomType,
                UserId = transaction.UserId,
                UserName = transaction.User?.Name,
                Reason = transaction.Reason,
                Status = transaction.Status ?? "PENDING",
                CreatedAt = transaction.CreatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss"),
                UpdatedAt = transaction.UpdatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss"),
                Price = transaction.Price,
                SupplierId = transaction.SupplierId,
                SupplierName = transaction.Supplier?.Name
            };
        }
    }
}
