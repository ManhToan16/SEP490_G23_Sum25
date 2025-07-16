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
                throw new Exceptions.ArgumentException("Số lượng lỗi không được vượt quá số lượng nhập.");
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
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
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

        public async Task<TransactionResponseDTO> CreateProvideTransaction(ProvideMaterialDTO provideDto,string userId)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || !user.UserRoles.Any(ur => ur.RoleName == "ADMIN" ))
            {
                throw new UnauthorizedAccessException("Chỉ admin mới có quyền phân phát vật tư.");
            }

            var material = await _materialRepository.FindByIdAsync(provideDto.MaterialId);
            if (material == null)
            {
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            }
            if (material.QuantityInStock < provideDto.Quantity)
            {
                throw new Exception("Số lượng tồn kho không đủ để phân phát.");
            }
            var room = await DetectRoomTypeAsync(provideDto.RoomId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Phòng không tồn tại.");
            }
            var transaction = new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                MaterialId = provideDto.MaterialId,
                TransactionType = "PROVIDE",
                Quantity = provideDto.Quantity,
                RoomId = provideDto.RoomId,
                RoomType = room, 
                UserId = userId,
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
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
                throw ex;
              
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
        public async Task<List<ProvidedSummaryDTO>> GetTotalProvidedByRoomType(string roomType)
        {
            if (string.IsNullOrEmpty(roomType) || (roomType != "EXAMINATION" && roomType != "LABORATORY"))
            {
                throw new Exceptions.ArgumentException("RoomType phải là EXAMINATION hoặc LABORATORY.");
            }
            var approvedTransactions = await _context.Transactions
                           .Where(t => t.TransactionType == "PROVIDE" && t.Status == "APPROVED" && t.RoomType == roomType)
                           .ToListAsync();

            if (!approvedTransactions.Any())
            {
                throw new ResourceNotFoundException("Không có giao dịch được phê duyệt cho phòng này.");
            }
            var summaries = await _context.Transactions
                .Where(t => t.TransactionType == "PROVIDE" && t.Status == "APPROVED" && t.RoomType == roomType)
                .GroupBy(t => t.Material.Name)
                .Select(g => new ProvidedSummaryDTO
                {
                    MaterialName = g.Key,
                    TotalQuantity = g.Sum(t => t.Quantity),
                    RoomType = roomType
                })
                .ToListAsync();           

            return summaries;
        }

        public async Task<List<ProvidedSummaryDTO>> GetTotalProvidedByRoomId(string roomId)
        {
            if (string.IsNullOrEmpty(roomId))
            {
                throw new Exceptions.ArgumentException("RoomId là bắt buộc.");
            }

            var roomType = await DetectRoomTypeAsync(roomId);
            var approvedTransactions = await _context.Transactions
               .Where(t => t.TransactionType == "PROVIDE" && t.Status == "APPROVED" && t.RoomType == roomType)
               .ToListAsync();

            if (!approvedTransactions.Any())
            {
                throw new ResourceNotFoundException("Không có giao dịch được phê duyệt cho phòng này.");
            }
            var summaries = await _context.Transactions
                .Where(t => t.TransactionType == "PROVIDE" && t.Status == "APPROVED" && t.RoomId == roomId)
                .GroupBy(t => t.Material.Name)
                .Select(g => new ProvidedSummaryDTO
                {
                    MaterialName = g.Key,
                    TotalQuantity = g.Sum(t => t.Quantity),
                    RoomId = roomId,
                    RoomType = roomType
                })
                .ToListAsync();
          

            return summaries;
        }
        public async Task<TransactionResponseDTO> UseMaterial(UseMaterialDTO useDto, string userId)
        {

            // Kiểm tra vai trò Nurse
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null )
            {
                throw new UnauthorizedAccessException("Không tìm thấy người dùng");
            }


            // Lấy tất cả giao dịch PROVIDE đã APPROVED cho roomId và materialId
            var approvedTransactions = await _context.Transactions
                .Where(t => t.TransactionType == "PROVIDE" && t.Status == "APPROVED" &&
                            t.RoomId == useDto.RoomId && t.MaterialId == useDto.MaterialId)
                .ToListAsync();

            if (!approvedTransactions.Any())
            {
                throw new ResourceNotFoundException("Không có vật tư nào được phân phát cho phòng này.");
            }

            int totalAvailableQuantity = approvedTransactions.Sum(t => t.Quantity);
            if (totalAvailableQuantity < useDto.Quantity)
            {
                throw new Exception("Số lượng vật tư yêu cầu vượt quá số lượng còn lại.");
            }

            // Giảm số lượng từ các giao dịch
            int remainingQuantityToUse = useDto.Quantity;
            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var transaction in approvedTransactions.OrderBy(t => t.CreatedAt))
                {
                    if (remainingQuantityToUse <= 0) break;

                    int quantityToDeduct = Math.Min(remainingQuantityToUse, transaction.Quantity);
                    transaction.Quantity -= quantityToDeduct;
                    remainingQuantityToUse -= quantityToDeduct;

                    if (transaction.Quantity == 0)
                    {
                        _context.Transactions.Remove(transaction);
                    }
                    else
                    {
                        transaction.UpdatedAt = DateTime.UtcNow;
                        await _transactionRepository.UpdateAsync(transaction);
                    }

                    // Ghi lịch sử sử dụng
                    var history = new TransactionHistory
                    {
                        Id = Guid.NewGuid().ToString(),
                        TransactionId = transaction.Id,
                        OldQuantity = transaction.Quantity + quantityToDeduct,
                        NewQuantity = transaction.Quantity,
                        OldReason = "Sử dụng vật tư",
                        NewReason = "Y tá sử dụng",
                        ChangedBy = userId,
                        ChangedAt = DateTime.UtcNow
                    };
                    await _transactionRepository.AddTransactionHistoryAsync(history);
                }
                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
                var remainingTransactions = await _context.Transactions
            .Where(t => t.TransactionType == "PROVIDE" && t.Status == "APPROVED" &&
                        t.RoomId == useDto.RoomId && t.MaterialId == useDto.MaterialId)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();

                if (remainingTransactions == null)
                {
                    throw new ResourceNotFoundException("Không còn giao dịch nào sau khi sử dụng vật tư.");
                }
                return MapToResponseDTO(remainingTransactions);

                // Trả về giao dịch cuối cùng được cập nhật (hoặc tạo mới nếu cần)
            }
            catch (Exception ex)
            {
                await transactionScope.RollbackAsync();
                throw new Exception("Đã xảy ra lỗi khi sử dụng vật tư: " + ex.Message);
            }


        }
        public async Task<TransactionResponseDTO> ApproveProvideTransaction(string transactionId, string adminId)
        {
            var transaction = await _transactionRepository.FindByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }
            if (transaction.Status != "PENDING" || transaction.TransactionType != "PROVIDE")
            {
                throw new Exception("Chỉ giao dịch phân phát đang chờ phê duyệt mới có thể được phê duyệt.");
            }

            var material = await _materialRepository.FindByIdAsync(transaction.MaterialId);
            if (material == null)
            {
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            }

            transaction.Status = "APPROVED";
            transaction.UpdatedAt = DateTime.UtcNow;

            var history = new TransactionHistory
            {
                Id = Guid.NewGuid().ToString(),
                TransactionId = transactionId,
                OldQuantity = transaction.Quantity,
                NewQuantity = transaction.Quantity,
                OldReason = "Chờ phê duyệt",
                NewReason = "Được phê duyệt",
                ChangedBy = adminId,
                ChangedAt = DateTime.UtcNow
            };

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                await _transactionRepository.UpdateAsync(transaction);
                await _transactionRepository.AddTransactionHistoryAsync(history);
                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
            }
            catch (Exception ex)
            {
                await transactionScope.RollbackAsync();
                throw new Exception("Đã xảy ra lỗi khi phê duyệt giao dịch phân phát: " + ex.Message);
            }
            return MapToResponseDTO(transaction);

        }

        public async Task<TransactionResponseDTO> RejectProvideTransaction(string transactionId, string adminId)
        {
            var transaction = await _transactionRepository.FindByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }
            if (transaction.Status != "PENDING" || transaction.TransactionType != "PROVIDE")
            {
                throw new Exception("Chỉ giao dịch phân phát đang chờ phê duyệt mới có thể bị từ chối.");
            }

            transaction.Status = "REJECTED";
            transaction.UpdatedAt = DateTime.UtcNow;

            var history = new TransactionHistory
            {
                Id = Guid.NewGuid().ToString(),
                TransactionId = transactionId,
                OldQuantity = transaction.Quantity,
                NewQuantity = transaction.Quantity,
                OldReason = "Chờ phê duyệt",
                NewReason = "Bị từ chối",
                ChangedBy = adminId,
                ChangedAt = DateTime.UtcNow
            };

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                await _transactionRepository.UpdateAsync(transaction);
                await _transactionRepository.AddTransactionHistoryAsync(history);
                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
            }
            catch (Exception ex)
            {
                await transactionScope.RollbackAsync();
                throw new Exception("Đã xảy ra lỗi khi từ chối giao dịch phân phát: " + ex.Message);
            }
            return MapToResponseDTO(transaction);

        }
        private async Task<string> DetectRoomTypeAsync(string roomId)
        {
            if (await _context.ExaminationRooms.AnyAsync(r => r.Id == roomId))
                return "EXAMINATION";

            if (await _context.LaboratoryRooms.AnyAsync(r => r.Id == roomId))
                return "LABORATORY";

            throw new ResourceNotFoundException("Không tìm thấy phòng.");
        }
    }
}
