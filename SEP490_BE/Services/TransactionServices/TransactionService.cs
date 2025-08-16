using SEP490_BE.DTO.TransactionDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.MaterialRepositories;
using SEP490_BE.Repositories.TransactionRepositories;
using Microsoft.EntityFrameworkCore;
using SEP490_BE.Repositories.TransactionDetailRepository;
using SEP490_BE.Repositories.ScheduleRepositories;
using SEP490_BE.Repositories.RoomMaterialStockRepositories;

namespace SEP490_BE.Services.TransactionServices
{
    public class TransactionService : ITransactionService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly ITransactionRepository _transactionRepository;
        private readonly ITransactionDetailRepository _transactionDetailRepository ;
        private readonly IMaterialRepository _materialRepository;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IRoomMaterialStockRepository _roomMaterialStockRepository;

        public TransactionService(KhanhAnNeurologyClinicContext context, ITransactionRepository transactionRepository, IMaterialRepository materialRepository, ITransactionDetailRepository transactionDetailRepository, IScheduleRepository scheduleRepository, IRoomMaterialStockRepository roomMaterialStockRepository)

        {
            _context = context;
            _transactionRepository = transactionRepository;
            _materialRepository = materialRepository;
            _transactionDetailRepository = transactionDetailRepository;
            _scheduleRepository = scheduleRepository;
            _roomMaterialStockRepository = roomMaterialStockRepository;
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
                Quantity = importDto.Quantity,
                DefectiveQuantity= importDto.DefectiveQuantity,   
                UserId = userId,
                Reason = importDto.Reason,
                Status = "APPROVED",
                SupplierId = material.SupplierId,
                Price = importDto.Price,
                CreatedAt = importDto.ImportDate,
                UpdatedAt = DateTime.UtcNow
            };
            var importHistory = new TransactionHistory
            {
                Id = Guid.NewGuid().ToString(),
                TransactionId = transaction.Id,
                OldQuantity = 0,
                NewQuantity = transaction.Quantity,
                OldReason = "Không có",
                NewReason = "Nhập hàng",
                ChangedBy = userId,
                ChangedAt = DateTime.UtcNow
            };
            Transaction? supplierReturnTransaction = null;
            TransactionHistory? supplierReturnHistory = null;

            if (importDto.DefectiveQuantity > 0)
            {
                supplierReturnTransaction = new Transaction
                {
                    Id = Guid.NewGuid().ToString(),
                    MaterialId = importDto.MaterialId,
                    TransactionType = "SUPPLIER_RETURN",
                    Quantity = importDto.DefectiveQuantity,
                    RoomId = null,
                    RoomType = null,
                    UserId = userId,
                    Reason = "Trả hàng lỗi khi nhập",
                    Status = "PENDING",
                    SupplierId = material.SupplierId,
                    Price = importDto.Price,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                supplierReturnHistory = new TransactionHistory
                {
                    Id = Guid.NewGuid().ToString(),
                    TransactionId = supplierReturnTransaction.Id,
                    OldQuantity = 0, // Chưa có trước đó
                    NewQuantity = importDto.DefectiveQuantity,
                    OldReason = "Không có",
                    NewReason = "Trả hàng lỗi khi nhập",
                    ChangedBy = userId,
                    ChangedAt = DateTime.UtcNow
                };
            }
            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                await _transactionRepository.AddAsync(transaction);
                await _transactionRepository.AddTransactionHistoryAsync(importHistory);
                if (supplierReturnTransaction != null)
                {
                    await _transactionRepository.AddAsync(supplierReturnTransaction);
                    await _transactionRepository.AddTransactionHistoryAsync(supplierReturnHistory!);
                }
                material.QuantityInStock += importDto.Quantity; // Tăng số lượng tồn kho
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

        public async Task<List<TransactionResponseDTO>> CreateProvideTransaction(ProvideMaterialDTO provideDto, string userId)
        {
            // 1. Kiểm tra quyền Admin
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || !user.UserRoles.Any(ur => ur.RoleName == "ADMIN"))
            {
                throw new UnauthorizedAccessException("Chỉ admin mới có quyền phân phát vật tư.");
            }

            var resultList = new List<TransactionResponseDTO>();

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                // 2. Lặp qua từng lô nhập (IMPORT)
                foreach (var transactionItem in provideDto.Transactions)
                {
                    var importTransaction = await _transactionRepository.FindByIdAsync(transactionItem.TransactionId);
                    if (importTransaction == null || importTransaction.TransactionType != "IMPORT")
                    {
                        throw new ResourceNotFoundException($"Transaction nhập hàng {transactionItem.TransactionId} không tồn tại.");
                    }

                    // 3. Kiểm tra số lượng đủ để phân phát
                    var totalProvideQty = transactionItem.Rooms.Sum(r => r.Quantity);
                    if (totalProvideQty > importTransaction.Quantity)
                    {
                        throw new Exceptions.ArgumentException(
                            $"Lô hàng {transactionItem.TransactionId} không đủ số lượng để phân phát. Còn lại: {importTransaction.Quantity}."
                        );
                    }

                    // 4. Lặp qua từng phòng trong lô nhập
                    foreach (var roomItem in transactionItem.Rooms)
                    {
                        var roomType = await DetectRoomTypeAsync(roomItem.RoomId);
                        if (roomType == null)
                        {
                            throw new ResourceNotFoundException($"Phòng {roomItem.RoomId} không tồn tại.");
                        }

                        // Tạo transaction PROVIDE
                        var provideTransaction = new Transaction
                        {
                            Id = Guid.NewGuid().ToString(),
                            MaterialId = importTransaction.MaterialId,
                            TransactionType = "PROVIDE",
                            Quantity = roomItem.Quantity,
                            RoomId = roomItem.RoomId,
                            RoomType = roomType,
                            UserId = userId,
                            Status = "PENDING",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        // Tạo TransactionDetail liên kết với lô nhập gốc
                        var detail = new TransactionDetail
                        {
                            Id = Guid.NewGuid(),
                            TransactionId = provideTransaction.Id,
                            ParentTransactionId = importTransaction.Id,
                            QuantityProvided = roomItem.Quantity
                        };

                        await _transactionRepository.AddAsync(provideTransaction);
                        await _transactionDetailRepository.AddAsync(detail);

                        resultList.Add(MapToResponseDTO(provideTransaction));
                    }

                    // 5. Giảm số lượng của lô nhập
                    importTransaction.Quantity -= totalProvideQty;
                    await _transactionRepository.UpdateAsync(importTransaction);

                    // 6. Giảm tồn kho vật tư
                    var material = await _materialRepository.FindByIdAsync(importTransaction.MaterialId);
                    if (material != null)
                    {
                        material.QuantityInStock -= totalProvideQty;
                        await _materialRepository.UpdateAsync(material);
                    }
                }

                // 7. Lưu thay đổi
                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
            }
            catch (Exception)
            {
                await transactionScope.RollbackAsync();
                throw;
            }

            return resultList;
        }


        public async Task<TransactionResponseDTO> RequestReturnTransaction(NurseReturnDTO returnDto, string userId)
        {
            var transaction = await _transactionRepository.FindByIdAsync(returnDto.TransactionId);
            if (transaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }
            if (transaction.Status != "APPROVED" || transaction.TransactionType != "PROVIDE")
            {
                throw new Exceptions.ArgumentException("Chỉ giao dịch cung cấp đã phê duyệt mới có thể đổi trả.");
            }
            if (returnDto.Quantity > transaction.Quantity)
            {
                throw new Exceptions.ArgumentException("Số lượng đổi trả không được vượt quá số lượng giao dịch.");
            }          
            var returnTransaction = new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                MaterialId = transaction.MaterialId,
                TransactionType = "NURSE_RETURN",
                Quantity = returnDto.Quantity,
                RoomId = transaction.RoomId,
                RoomType = transaction.RoomType,
                UserId = userId,
                Reason = returnDto.Reason,
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var history = new TransactionHistory
            {
                Id = Guid.NewGuid().ToString(),
                TransactionId = transaction.Id,
                OldQuantity = transaction.Quantity,
                NewQuantity = returnDto.Quantity,
                OldReason = "Đang sử dụng",
                NewReason = "Báo cáo hỏng từ y tá",
                ChangedBy = userId,
                ChangedAt = DateTime.UtcNow
            };

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                await _transactionRepository.AddAsync(returnTransaction);
                await _transactionRepository.AddTransactionHistoryAsync(history);
                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
            }
            catch (Exception ex)
            {
                await transactionScope.RollbackAsync();
                throw new Exception("Đã xảy ra lỗi khi yêu cầu đổi trả: " + ex.Message);
            }
            return MapToResponseDTO(returnTransaction);

        }
        public async Task<TransactionResponseDTO> RequestAdminReturnTransaction(AdminReturnDTO returnDto, string adminId)
        {
            var originalTransaction = await _transactionRepository.FindByIdAsync(returnDto.TransactionId);
            if (originalTransaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }
            if (returnDto.Quantity > originalTransaction.Quantity)
            {
                throw new Exception("Số lượng đổi trả không được vượt quá số lượng giao dịch.");
            }

            var supplierReturnTransaction = new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                MaterialId = originalTransaction.MaterialId,
                TransactionType = "SUPPLIER_RETURN",
                Quantity = returnDto.Quantity,
                RoomId = null, 
                RoomType = null,
                UserId = adminId,
                Reason = returnDto.Reason,
                Status = "PENDING",
                SupplierId = originalTransaction.SupplierId,
                Price = originalTransaction.Price, 
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var history = new TransactionHistory
            {
                Id = Guid.NewGuid().ToString(),
                TransactionId = supplierReturnTransaction.Id,
                OldQuantity = originalTransaction.Quantity,
                NewQuantity = returnDto.Quantity,
                OldReason = originalTransaction.Reason ?? "Đang tồn kho",
                NewReason = "Yêu cầu đổi trả lên nhà cung cấp",
                ChangedBy = adminId,
                ChangedAt = DateTime.UtcNow
            };

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                await _transactionRepository.AddAsync(supplierReturnTransaction);
                await _transactionRepository.AddTransactionHistoryAsync(history);
                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
            }
            catch (Exception ex)
            {
                await transactionScope.RollbackAsync();
                throw new Exception("Đã xảy ra lỗi khi gửi yêu cầu đổi trả lên nhà cung cấp: " + ex.Message);
            }
            return MapToResponseDTO(supplierReturnTransaction);

        }
        public async Task<TransactionResponseDTO> ApproveReturnTransaction(string transactionId, string adminId)
        {


            var transaction = await _transactionRepository.FindByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }
            if (transaction.Status != "PENDING" || transaction.TransactionType != "NURSE_RETURN")
            {
                throw new Exceptions.ArgumentException("Giao dịch không thể phê duyệt báo cáo hỏng từ y tá.");
            }

            var material = await _materialRepository.FindByIdAsync(transaction.MaterialId);
            if (material == null)
            {
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            }


            transaction.Status = "APPROVED";
            transaction.UpdatedAt = DateTime.UtcNow;
            material.QuantityInStock += transaction.Quantity; // Tăng lại số lượng tồn kho
            transaction.DefectiveQuantity = transaction.Quantity; // Cập nhật số lượng lỗi

            var history = new TransactionHistory
            {
                Id = Guid.NewGuid().ToString(),
                TransactionId = transactionId,
                OldQuantity = 0, // Giả định ban đầu
                NewQuantity = transaction.Quantity,
                OldReason = transaction.Reason ?? "",
                NewReason = "Báo cáo hỏng từ y tá được phê duyệt",
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

            var transaction = await _transactionRepository.FindByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }
            if (transaction.Status != "PENDING" || transaction.TransactionType != "NURSE_RETURN")
            {
                throw new Exceptions.ArgumentException("Giao dịch không thể phê duyệt báo cáo hỏng từ y tá");
            }

            transaction.Status = "REJECTED";
            transaction.UpdatedAt = DateTime.UtcNow;
            var history = new TransactionHistory
            {
                Id = Guid.NewGuid().ToString(),
                TransactionId = transactionId,
                OldQuantity = transaction.Quantity,
                NewQuantity = transaction.Quantity,
                OldReason = transaction.Reason ?? "",
                NewReason = "Báo cáo hỏng từ y tá bị từ chối",
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

        public async Task<List<TransactionResponseDTO>> GetAllTransactions(string? materialId, string? transactionType, string? status)
        {
            var (transactions, _) = await _transactionRepository.FindAll(materialId, transactionType, status, 1, int.MaxValue);
       //     var filteredTransactions = transactions
       //.Where(t => !string.Equals(t.Status, "APPROVED", StringComparison.OrdinalIgnoreCase))
       //.Select(MapToResponseDTO)
       //.ToList();

       //     return filteredTransactions;
            return transactions.Select(MapToResponseDTO).ToList();
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
                Status = transaction.Status ,
                CreatedAt = transaction.CreatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss"),
                UpdatedAt = transaction.UpdatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss"),
                Price = transaction.Price,
                SupplierId = transaction.Material?.SupplierId,
                SupplierName = transaction.Material?.Supplier?.Name

            };
        }
        public async Task<List<ProvidedSummaryDTO>> GetTotalProvidedByRoomType(string roomType)
        {
            if (string.IsNullOrEmpty(roomType) || (roomType != "EXAMINATION" && roomType != "LABORATORY"))
            {
                throw new Exceptions.ArgumentException("RoomType phải là EXAMINATION hoặc LABORATORY.");
            }

            var data = await _context.Transactions
                .Where(t => t.TransactionType == "PROVIDE" && t.Status == "APPROVED" && t.RoomType == roomType)
                .Join(_context.TransactionDetails,
                    provide => provide.Id,
                    detail => detail.TransactionId,
                    (provide, detail) => new { provide, detail })
                .Join(_context.Transactions,
                    pd => pd.detail.ParentTransactionId,
                    import => import.Id,
                    (pd, import) => new
                    {
                        MaterialId=import.MaterialId,
                        MaterialName = import.Material.Name,
                        pd.provide.RoomId,
                        pd.provide.RoomType,
                        BatchId = import.Id,
                        Quantity = pd.provide.Quantity
                    })
                .ToListAsync();

            if (!data.Any())
            {
                throw new ResourceNotFoundException("Không có giao dịch được phê duyệt cho loại phòng này.");
            }

            var summaries = data
                .GroupBy(x => new {x.MaterialId, x.MaterialName, x.RoomId, x.RoomType })
                .Select(g => new ProvidedSummaryDTO
                {
                    MaterialId=g.Key.MaterialId,
                    MaterialName = g.Key.MaterialName,
                    RoomId = g.Key.RoomId,
                    RoomType = g.Key.RoomType,
                    BatchInfo = g.GroupBy(b => b.BatchId)
                                 .Select(bg => new BatchInfoDTO
                                 {
                                     TransactionId = bg.Key,
                                     Quantity = bg.Sum(x => x.Quantity)
                                 }).ToList()
                })
                .ToList();

            foreach (var s in summaries)
            {
                s.RoomName = await GetRoomNameAsync(s.RoomId!, s.RoomType!);
                s.IsLowStock = s.TotalQuantity < 10;
            }

            return summaries;
        }


        public async Task<List<ProvidedSummaryDTO>> GetTotalProvidedByRoomId(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new Exceptions.ArgumentException("UserId là bắt buộc.");

            var today = DateTime.UtcNow.Date;
            var schedules = await _scheduleRepository.GetSchedulesByUserAndDateRangeAsync(
                userId,
                today,
                today
            );

            var roomIds = schedules
                .Where(s => s.Role != null && s.Role.Equals("NURSE", StringComparison.OrdinalIgnoreCase))
                .Select(s => s.RoomId)
                .Distinct()
                .ToList();

            if (!roomIds.Any())
                throw new ResourceNotFoundException("Người dùng không có lịch làm việc tại phòng nào hôm nay.");

            var summaries = new List<ProvidedSummaryDTO>();

            foreach (var roomId in roomIds)
            {
                var roomType = await DetectRoomTypeAsync(roomId);

                var stockList = await _context.RoomMaterialStocks
                    .Include(rms => rms.Material)
                    .Where(rms => rms.RoomId == roomId)
                    .ToListAsync();

                if (!stockList.Any())
                    continue;

                var roomSummaries = stockList
                    .GroupBy(s => new { s.MaterialId,s.Material.Name, s.RoomId, s.RoomType })
                    .Select(g => new ProvidedSummaryDTO
                    {
                        MaterialId=g.Key.MaterialId,
                        MaterialName = g.Key.Name,
                        RoomId = g.Key.RoomId,
                        RoomType = g.Key.RoomType,
                        BatchInfo = g.Select(x => new BatchInfoDTO
                        {
                            TransactionId = null,
                            Quantity = x.Quantity
                        }).ToList()
                    })
                    .ToList();

                foreach (var s in roomSummaries)
                {
                    s.RoomName = await GetRoomNameAsync(s.RoomId!, s.RoomType!);
                    s.IsLowStock = s.TotalQuantity < 10;
                }

                summaries.AddRange(roomSummaries);
            }

            return summaries;
        }

        public async Task<List<ProvidedSummaryDTO>> GetHistoryProvidedByRoomId(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new Exceptions.ArgumentException("UserId là bắt buộc.");

            var today = DateTime.UtcNow.Date;
            var schedules = await _scheduleRepository.GetSchedulesByUserAndDateRangeAsync(
                userId,
                today,
                today
            );

            var roomIds = schedules
                .Where(s => s.Role != null && s.Role.Equals("NURSE", StringComparison.OrdinalIgnoreCase))
                .Select(s => s.RoomId)
                .Distinct()
                .ToList();

            if (!roomIds.Any())
                throw new ResourceNotFoundException("Người dùng không có lịch làm việc tại phòng nào hôm nay.");

            var summaries = new List<ProvidedSummaryDTO>();

            foreach (var roomId in roomIds)
            {
                var roomType = await DetectRoomTypeAsync(roomId);

                var data = await _context.Transactions
                    .Where(t => t.TransactionType == "PROVIDE" && t.Status == "APPROVED" && t.RoomId == roomId)
                    .Join(_context.TransactionDetails,
                        provide => provide.Id,
                        detail => detail.TransactionId,
                        (provide, detail) => new { provide, detail })
                    .Join(_context.Transactions,
                        pd => pd.detail.ParentTransactionId,
                        import => import.Id,
                        (pd, import) => new
                        {
                              MaterialId=import.MaterialId,
                            MaterialName = import.Material.Name,
                            pd.provide.RoomId,
                            ProvideTransactionId = pd.provide.Id,
                            pd.provide.RoomType,
                            BatchId = import.Id,
                            Quantity = pd.provide.Quantity
                        })
                    .ToListAsync();

                if (!data.Any())
                    continue;

                var roomSummaries = data
                    .GroupBy(x => new { x.MaterialId,x.MaterialName, x.RoomId, x.RoomType })
                    .Select(g => new ProvidedSummaryDTO
                    {
                        MaterialId = g.Key.MaterialId,
                        MaterialName = g.Key.MaterialName,
                        RoomId = g.Key.RoomId,
                        RoomType = g.Key.RoomType,
                        BatchInfo = g.Select(x => new BatchInfoDTO
                        {
                            TransactionId = x.ProvideTransactionId,
                            Quantity = x.Quantity
                        }).ToList()
                    })
                    .ToList();

                foreach (var s in roomSummaries)
                {
                    s.RoomName = await GetRoomNameAsync(s.RoomId!, s.RoomType!);
                    s.IsLowStock = s.TotalQuantity < 10;
                }

                summaries.AddRange(roomSummaries);
            }

            return summaries;
        }


        public async Task<List<ProvidedSummaryDTO>> GetTotalProvidedForAllRooms(string? materialName = null)
        {
            var query = _context.Transactions
                .Where(t => t.TransactionType == "PROVIDE" && t.Status == "APPROVED")
                .Join(_context.TransactionDetails,
                    provide => provide.Id,
                    detail => detail.TransactionId,
                    (provide, detail) => new { provide, detail })
                .Join(_context.Transactions,
                    pd => pd.detail.ParentTransactionId,
                    import => import.Id,
                    (pd, import) => new
                    {
                        MaterialName = import.Material.Name,
                        pd.provide.RoomId,
                        pd.provide.RoomType,
                        BatchId = import.Id,
                        Quantity = pd.provide.Quantity
                    });
            if (!string.IsNullOrWhiteSpace(materialName))
            {
                query = query.Where(x => x.MaterialName.Contains(materialName));
            }

            var data = await query.ToListAsync();

            if (!data.Any())
            {
                throw new ResourceNotFoundException("Không có giao dịch vật tư được phê duyệt nào.");
            }

            var grouped = data
                .GroupBy(x => new { x.MaterialName, x.RoomId, x.RoomType })
                .Select(g => new ProvidedSummaryDTO
                {
                    MaterialName = g.Key.MaterialName,
                    RoomId = g.Key.RoomId,
                    RoomType = g.Key.RoomType,
                    RoomName = "", // sẽ set sau
                    BatchInfo = g.GroupBy(b => b.BatchId)
                                 .Select(bg => new BatchInfoDTO
                                 {
                                     TransactionId = bg.Key,
                                     Quantity = bg.Sum(x => x.Quantity)
                                 }).ToList()
                })
                .ToList();

            // Bổ sung tên phòng
            foreach (var item in grouped)
            {
                item.RoomName = await GetRoomNameAsync(item.RoomId, item.RoomType);
                item.IsLowStock = item.TotalQuantity < 10;
            }

            return grouped;
        }

        public async Task UseMaterialAsync(UseMaterialDTO useDto, string userId)
        {
            // Kiểm tra user
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new UnauthorizedAccessException("Không tìm thấy người dùng");

            // Lấy tồn kho của phòng
            var roomStock = await _roomMaterialStockRepository
                .GetByRoomAndMaterialAsync(useDto.RoomId, useDto.MaterialId)
                ?? throw new ResourceNotFoundException("Không tìm thấy tồn kho phòng cho vật tư này.");

            if (roomStock.Quantity < useDto.Quantity)
                throw new Exceptions.ArgumentException("Số lượng tồn kho phòng không đủ để sử dụng.");
            var approvedTransactions = await _context.Transactions
    .Where(t => t.TransactionType == "PROVIDE"
        && t.Status == "APPROVED"
        && t.RoomId == roomStock.RoomId
        && t.MaterialId == roomStock.MaterialId)
    .ToListAsync();
            var latestTransaction = approvedTransactions.FirstOrDefault();
            if (latestTransaction == null)
            {
                throw new Exceptions.ArgumentException("Không tìm thấy giao dịch cung cấp đã duyệt cho phòng này.");
            }

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                // Giảm tồn kho
                int oldQty = roomStock.Quantity;
                roomStock.Quantity -= useDto.Quantity;
                await _roomMaterialStockRepository.UpdateAsync(roomStock);

                // Ghi lịch sử
                var history = new TransactionHistory
                {
                    Id = Guid.NewGuid().ToString(),
                    TransactionId = latestTransaction.Id,
                    OldQuantity = oldQty,
                    NewQuantity = roomStock.Quantity,
                    OldReason = "Sử dụng vật tư",
                    NewReason = "Y tá sử dụng",
                    ChangedBy = userId,
                    ChangedAt = DateTime.UtcNow
                };
                await _transactionRepository.AddTransactionHistoryAsync(history);

                await _context.SaveChangesAsync();
                await transactionScope.CommitAsync();
            }
            catch
            {
                await transactionScope.RollbackAsync();
                throw;
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
                throw new Exceptions.ArgumentException("Chỉ giao dịch phân phát đang chờ phê duyệt mới có thể được phê duyệt.");
            }

            var material = await _materialRepository.FindByIdAsync(transaction.MaterialId);
            if (material == null)
            {
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            }
            var provideDetails = await _transactionDetailRepository.GetByTransactionIdAsync(transactionId);
            if (!provideDetails.Any())
            {
                throw new Exceptions.ArgumentException("Không tìm thấy chi tiết giao dịch phân phát.");
            }
      
            transaction.Status = "APPROVED";
            transaction.UpdatedAt = DateTime.UtcNow;
            if (material.QuantityInStock < 0)
            {
                throw new Exceptions.ArgumentException("Số lượng tồn kho không đủ để phân phát.");
            }

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
                if (transaction.RoomId != null)
                {
                    var roomStock = await _roomMaterialStockRepository.GetByRoomAndMaterialAsync(
                        transaction.RoomId,
                        transaction.MaterialId
                    );

                    if (roomStock == null)
                    {
                        roomStock = new RoomMaterialStock
                        {
                            Id = Guid.NewGuid().ToString(),
                            RoomId = transaction.RoomId,
                            RoomType = transaction.RoomType,
                            MaterialId = transaction.MaterialId,
                            Quantity = transaction.Quantity
                        };
                        await _roomMaterialStockRepository.AddAsync(roomStock);
                    }
                    else
                    {
                        roomStock.Quantity += transaction.Quantity;
                        await _roomMaterialStockRepository.UpdateAsync(roomStock);
                    }
                }
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
            var material = await _materialRepository.FindByIdAsync(transaction.MaterialId);
            if (material == null)
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            var provideDetails = await _transactionDetailRepository.GetByTransactionIdAsync(transactionId);
            if (!provideDetails.Any())
                throw new Exceptions.ArgumentException("Không tìm thấy chi tiết giao dịch phân phát.");

            // 1. Cộng lại số lượng vào lô nhập gốc
            foreach (var detail in provideDetails)
            {
                if (!string.IsNullOrEmpty(detail.ParentTransactionId))
                {
                    var parentTransaction = await _transactionRepository.FindByIdAsync(detail.ParentTransactionId);
                    if (parentTransaction != null)
                    {
                        parentTransaction.Quantity += detail.QuantityProvided ?? 0;
                        await _transactionRepository.UpdateAsync(parentTransaction);
                    }
                }
            }
            material.QuantityInStock += transaction.Quantity;
            await _materialRepository.UpdateAsync(material);
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
        private async Task<string> GetRoomNameAsync(string roomId, string roomType)
        {
            if (roomType == "EXAMINATION")
            {
                var room = await _context.ExaminationRooms.FindAsync(roomId);
                return room?.Name;
            }
            else if (roomType == "LABORATORY")
            {
                var room = await _context.LaboratoryRooms.FindAsync(roomId);
                return room?.Name;
            }
            return null;
        }

        public async Task<List<TransactionResponseDTO>> GetDefectiveBatches()
        {
            var defectiveTransactions = await _context.Transactions
                .Include(x => x.Material)
                    .ThenInclude(m => m.Supplier) 
                .Include(x => x.User)
                .Where(t => t.TransactionType == "SUPPLIER_RETURN" && t.Quantity > 0)
                .OrderBy(t => t.CreatedAt)
                .ToListAsync();

            if (!defectiveTransactions.Any())
            {
                throw new ResourceNotFoundException("Không có lô hàng nào có hàng lỗi.");
            }

            return defectiveTransactions.Select(MapToResponseDTO).ToList();
        }

        public async Task<TransactionResponseDTO> ApproveAdminReturnTransaction(string transactionId, string adminId)
        {

            var transaction = await _transactionRepository.FindByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }
            if (transaction.Status != "PENDING" || transaction.TransactionType != "SUPPLIER_RETURN")
            {
                throw new Exceptions.ArgumentException("Giao dịch không thể phê duyệt đổi trả hàng hóa.");
            }

            var material = await _materialRepository.FindByIdAsync(transaction.MaterialId);
            if (material == null)
            {
                throw new ResourceNotFoundException("Vật tư không tồn tại.");
            }
            var importTransaction = await _context.Transactions
    .Where(t => t.TransactionType == "IMPORT"
                && t.MaterialId == transaction.MaterialId
                && t.SupplierId == transaction.SupplierId
                && t.DefectiveQuantity == transaction.Quantity
                && t.CreatedAt <= transaction.CreatedAt)
    .OrderByDescending(t => t.CreatedAt) // lấy gần nhất
    .FirstOrDefaultAsync();

            if (importTransaction == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy giao dịch nhập hàng liên quan.");
            }
            //importTransaction.Quantity += transaction.Quantity;
            importTransaction.DefectiveQuantity -= transaction.Quantity;
            transaction.Status = "APPROVED";
            transaction.UpdatedAt = DateTime.UtcNow;

            var history = new TransactionHistory
            {
                Id = Guid.NewGuid().ToString(),
                TransactionId = transactionId,
                OldQuantity = transaction.Quantity, 
                NewQuantity = transaction.Quantity,
                OldReason = transaction.Reason ?? "",
                NewReason = "Đổi trả hàng hóa được phê duyệt",
                ChangedBy = adminId,
                ChangedAt = DateTime.UtcNow
            };

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                await _transactionRepository.UpdateAsync(transaction);
                await _transactionRepository.UpdateAsync(importTransaction);
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

        public async Task<TransactionResponseDTO> RejectAdminReturnTransaction(string transactionId, string adminId)
        {
            var transaction = await _transactionRepository.FindByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");
            }
            if (transaction.Status != "PENDING" || transaction.TransactionType != "SUPPLIER_RETURN")
            {
                throw new Exceptions.ArgumentException("Giao dịch không thể phê duyệt đổi trả hàng hóa");
            }

            transaction.Status = "REJECTED";
            transaction.UpdatedAt = DateTime.UtcNow;
            var history = new TransactionHistory
            {
                Id = Guid.NewGuid().ToString(),
                TransactionId = transactionId,
                OldQuantity = transaction.Quantity,
                NewQuantity = transaction.Quantity,
                OldReason = transaction.Reason ?? "",
                NewReason = "Yêu cầu đổi trả lên nhà cung cấp bị từ chối",
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
            catch
            {
                await transactionScope.RollbackAsync();
                throw;
            }
            return MapToResponseDTO(transaction);

        }
        public async Task<List<TransactionHistoryDTO>> GetTransactionHistories(string? transactionId = null)
        {
            var query = _context.TransactionHistories.AsQueryable();
            if (!string.IsNullOrEmpty(transactionId))
            {
                query = query.Where(th => th.TransactionId == transactionId);
            }

            var histories = await query
                .OrderBy(th => th.ChangedAt)
                .Select(th => new TransactionHistoryDTO
                {
                    Id = th.Id,
                    TransactionId = th.TransactionId,
                    OldQuantity = th.OldQuantity,
                    NewQuantity = th.NewQuantity,
                    OldReason = th.OldReason,
                    NewReason = th.NewReason,
                    ChangedBy = th.ChangedBy,
                    ChangedAt = th.ChangedAt
                })
                .ToListAsync();

            if (!histories.Any() && !string.IsNullOrEmpty(transactionId))
            {
                throw new ResourceNotFoundException($"Không tìm thấy lịch sử giao dịch cho TransactionId: {transactionId}.");
            }

            return histories;
        }
        public async Task<List<ProvideHistoryDTO>> GetProvideHistoryAsync(string? materialName, string? roomName)
        {
            var query = _context.Transactions
                .Include(t => t.Material)
                .Include(t => t.User)
                .Include(t => t.TransactionDetailTransactions)
                .AsQueryable();

            // Chỉ lấy PROVIDE + APPROVED
            // Chỉ lấy PROVIDE + APPROVED + PENDING
            var allowedStatuses = new[] { "APPROVED", "PENDING" };
            query = query.Where(t => t.TransactionType == "PROVIDE" && allowedStatuses.Contains(t.Status));


            // Lọc vật tư
            if (!string.IsNullOrWhiteSpace(materialName))
            {
                query = query.Where(t => t.Material.Name.Contains(materialName));
            }

            // Lọc phòng theo tên
            if (!string.IsNullOrWhiteSpace(roomName))
            {
                var examRoomIds = await _context.ExaminationRooms
                    .Where(r => r.Name.Contains(roomName))
                    .Select(r => r.Id)
                    .ToListAsync();

                var labRoomIds = await _context.LaboratoryRooms
                    .Where(r => r.Name.Contains(roomName))
                    .Select(r => r.Id)
                    .ToListAsync();

                var allRoomIds = examRoomIds.Concat(labRoomIds).ToList();
                query = query.Where(t => allRoomIds.Contains(t.RoomId ?? ""));
            }

            var histories = await query.ToListAsync();

            var result = histories
        .GroupBy(t => new
        {
            t.MaterialId,
            CreatedAt = t.CreatedAt.HasValue
                ? t.CreatedAt.Value.Date // gom theo ngày
                : DateTime.MinValue
        })
        .Select(group => new ProvideHistoryDTO
        {
            MaterialId = group.Key.MaterialId,
            MaterialName = group.First().Material.Name,
            CreatedBy = group.First().User.Name,
            CreatedAt = group.Key.CreatedAt,
            RoomDetails = group
                .SelectMany(t => t.TransactionDetailTransactions)
                .GroupBy(td => new { td.Transaction.RoomId, td.Transaction.RoomType })
                .Select(roomGroup => new RoomDetailDTO
                {
                    RoomId = roomGroup.Key.RoomId ?? string.Empty,
                    RoomType = roomGroup.Key.RoomType ?? string.Empty,
                    RoomName = string.Empty, // set sau
                    BatchInfo = roomGroup
                        .Select(td => new BatchInfoDTO
                        {
                            TransactionId = td.TransactionId,
                            Quantity = td.QuantityProvided ?? 0,
                            Status = td.Transaction.Status
                        })
                        .ToList()
                })
                .ToList()
        })
        .ToList();


            // Gọi GetRoomNameAsync để gán RoomName
            foreach (var history in result)
            {
                foreach (var room in history.RoomDetails)
                {
                    room.RoomName = await GetRoomNameAsync(room.RoomId, room.RoomType);
                }
            }

            return result;
        }

        public async Task<TransactionResponseDTO> UpdateDefectiveQuantityAsync(string transactionId, int newDefectiveQuantity, string updatedBy)
        {
            var transaction = await _context.Transactions
                .Include(t => t.Material)
                    .ThenInclude(m => m.Supplier)
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == transactionId);

            if (transaction == null)
                throw new ResourceNotFoundException("Giao dịch không tồn tại.");

            if (transaction.TransactionType != "SUPPLIER_RETURN")
                throw new InvalidOperationException("Chỉ chỉnh sửa số lượng lỗi cho giao dịch nhập hàng.");

            if (newDefectiveQuantity < 0)
                throw new Exceptions.ArgumentException("Số lượng lỗi không hợp lệ.");

            // Kiểm tra hết hàng ở Transaction hoặc trong kho
            if (transaction.Quantity == 0)
                throw new Exceptions.ArgumentException("Đơn hàng này đã hết hàng dùng được, không thể chỉnh sửa.");

            if (transaction.Material.QuantityInStock == 0)
                throw new Exceptions.ArgumentException("Vật tư này đã hết hàng trong kho, không thể chỉnh sửa.");

            var totalOriginal = transaction.Quantity + (transaction.DefectiveQuantity ?? 0);
            if (newDefectiveQuantity > totalOriginal)
                throw new Exceptions.ArgumentException("Số lượng lỗi không được vượt quá tổng số lượng nhập.");

            var oldDefective = transaction.DefectiveQuantity ?? 0;
            var oldQuantity = transaction.Quantity;

            // Tính chênh lệch và cập nhật
            var delta = newDefectiveQuantity - oldDefective;
            transaction.DefectiveQuantity = newDefectiveQuantity;
            transaction.Quantity = oldQuantity - delta;
            transaction.UpdatedAt = DateTime.UtcNow;

            // Cập nhật tồn kho vật tư (QuantityInStock)
            transaction.Material.QuantityInStock -= delta;

            // Ghi lịch sử
            var history = new TransactionHistory
            {
                Id = Guid.NewGuid().ToString(),
                TransactionId = transaction.Id,
                OldQuantity = oldQuantity,
                NewQuantity = transaction.Quantity,
                OldReason = $"Defective: {oldDefective}",
                NewReason = $"Defective: {newDefectiveQuantity}",
                ChangedBy = updatedBy,
                ChangedAt = DateTime.UtcNow
            };

            using var transactionScope = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Transactions.Update(transaction);
                _context.Materials.Update(transaction.Material);
                await _transactionRepository.AddTransactionHistoryAsync(history);
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

        public async Task<List<TransactionResponseDTO>> GetImportHistoryByMaterialIdAsync(string materialId)
        {
            var transactions = await _context.Transactions
                .Where(t => t.MaterialId == materialId && t.TransactionType == "IMPORT")
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
            var importHistories = await _context.TransactionHistories
        .Where(h => transactions.Select(t => t.Id).Contains(h.TransactionId)
                    && h.NewReason == "Nhập hàng")
        .ToListAsync();

            if (!transactions.Any())
            {
                throw new ResourceNotFoundException("Không tìm thấy lịch sử nhập hàng cho vật tư này.");
            }
            var providedTransactionIds = await _context.TransactionDetails
       .Where(td => transactions.Select(t => t.Id).Contains(td.ParentTransactionId) &&
                    td.Transaction != null &&
                    td.Transaction.TransactionType == "PROVIDE")
       .Select(td => td.ParentTransactionId)
       .Distinct()
       .ToListAsync();
            return transactions.Select(t =>
            {
                var dto = MapToResponseDTO(t);
                dto.IsEdit = !providedTransactionIds.Contains(t.Id);
                var history = importHistories.FirstOrDefault(h => h.TransactionId == t.Id);
                if (history != null)
                {
                    dto.Quantity = history.NewQuantity;
                }
                return dto;
            }).ToList();
        }

        public async Task<List<TransactionResponseDTO>> GetImporToProvide(string materialId)
        {
            var transactions = await _context.Transactions
                .Where(t => t.MaterialId == materialId && t.TransactionType == "IMPORT" && t.Quantity >0)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            if (!transactions.Any())
            {
                throw new ResourceNotFoundException("Không tìm thấy lịch sử nhập hàng cho vật tư này.");
            }

            return transactions.Select(MapToResponseDTO).ToList();
        }


        public async Task<TransactionResponseDTO> UpdateImportTransactionAsync(string transactionId, ImportMaterialDTO updateDto, string userId)
        {
            // BEGIN DB TRANSACTION
            using var dbTrans = await _context.Database.BeginTransactionAsync();
            try
            {
                var transaction = await _context.Transactions
                    .Include(t => t.TransactionDetailTransactions)
                    .FirstOrDefaultAsync(t => t.Id == transactionId && t.TransactionType == "IMPORT");

                if (transaction == null)
                    throw new ResourceNotFoundException("Giao dịch nhập không tồn tại.");

                // Check quyền Admin
                var user = await _context.Users
                    .Include(u => u.UserRoles)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null || !user.UserRoles.Any(ur => ur.RoleName == "ADMIN"))
                    throw new UnauthorizedAccessException("Chỉ admin mới có quyền chỉnh sửa giao dịch nhập.");

                // Kiểm tra vật tư tồn tại
                var material = await _materialRepository.FindByIdAsync(updateDto.MaterialId);
                if (material == null)
                    throw new ResourceNotFoundException("Vật tư không tồn tại.");

                // Validate số lượng lỗi
                if (updateDto.DefectiveQuantity >= updateDto.Quantity)
                    throw new Exceptions.ArgumentException("Số lượng lỗi không được vượt quá số lượng nhập.");

                // Tính các giá trị cũ và mới
                var oldTotalQty = (transaction.Quantity) + (transaction.DefectiveQuantity ?? 0); 
                var newTotalQty = updateDto.Quantity + (updateDto.DefectiveQuantity); 
                var oldDefective = transaction.DefectiveQuantity ?? 0;
                var newDefective = updateDto.DefectiveQuantity;

                var oldAvailable = transaction.Quantity; // khả dụng trước
                var newAvailable = newTotalQty - newDefective; // khả dụng sau

                // Kiểm tra xem lô đã được phân phát chưa
                bool hasBeenProvided = await _context.TransactionDetails
                    .AnyAsync(td => td.ParentTransactionId == transactionId &&
                                    td.Transaction != null &&
                                    td.Transaction.TransactionType == "PROVIDE");

                if (hasBeenProvided)
                {
                    // Nếu đã phân phát thì KHÔNG được thay đổi tổng nhập
                    if (newTotalQty != oldTotalQty)
                    {
                        throw new InvalidOperationException("Lô hàng này đã được phân phát, không thể thay đổi tổng số lượng nhập.");
                    }

                  
                }
                else
                {
                    // Chưa phân phát: cập nhật tồn kho theo chênh lệch tổng nhập
                    var diff = newTotalQty - oldTotalQty; // có thể âm hoặc dương
                    material.QuantityInStock = (material.QuantityInStock) + diff;

                    if (material.QuantityInStock < 0)
                    {
                        throw new InvalidOperationException("Cập nhật làm tồn kho âm, hành động bị hủy.");
                    }

                    await _materialRepository.UpdateAsync(material);
                }

                // Lưu thông tin cũ để history
                var history = new TransactionHistory
                {
                    Id = Guid.NewGuid().ToString(),
                    TransactionId = transaction.Id,
                    OldQuantity = oldTotalQty,
                    NewQuantity = newTotalQty,
                    OldReason = transaction.Reason,
                    NewReason = updateDto.Reason,
                    ChangedBy = userId,
                    ChangedAt = DateTime.UtcNow
                };

                _context.TransactionHistories.Add(history);

                // Cập nhật transaction (lưu ý: transaction.Quantity là "available")
                transaction.MaterialId = updateDto.MaterialId;
                transaction.Price = updateDto.Price;
                transaction.DefectiveQuantity = newDefective;
                transaction.Quantity = newAvailable; // available = total - defective
                transaction.Reason = updateDto.Reason;
                transaction.CreatedAt = updateDto.ImportDate;
                transaction.UpdatedAt = DateTime.UtcNow;
                

                await _context.SaveChangesAsync();
                await dbTrans.CommitAsync();

                // Trả về DTO
                return new TransactionResponseDTO
                {
                    Id = transaction.Id,
                    MaterialId = transaction.MaterialId,
                    Quantity = transaction.Quantity,
                    DefectiveQuantity = transaction.DefectiveQuantity,
                    Price = transaction.Price,
                    Reason = transaction.Reason,
                    Status = transaction.Status,
                    CreatedAt = transaction.CreatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss"),
                    UpdatedAt = transaction.UpdatedAt?.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss"),
                    IsEdit = true
                };
            }
            catch
            {
                await dbTrans.RollbackAsync();
                throw;
            }
        }
        public async Task DeleteImportTransactionAsync(string transactionId, string userId)
        {
            using var dbTrans = await _context.Database.BeginTransactionAsync();
            try
            {
                var transaction = await _context.Transactions
                    .FirstOrDefaultAsync(t => t.Id == transactionId && t.TransactionType == "IMPORT");

                if (transaction == null)
                    throw new ResourceNotFoundException("Giao dịch nhập không tồn tại.");

                var user = await _context.Users
                    .Include(u => u.UserRoles)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null || !user.UserRoles.Any(ur => ur.RoleName == "ADMIN"))
                    throw new UnauthorizedAccessException("Chỉ admin mới có quyền xóa giao dịch nhập.");

             

                bool hasBeenProvided = await _context.TransactionDetails
                    .AnyAsync(td => td.ParentTransactionId == transactionId &&
                                    td.Transaction != null &&
                                    td.Transaction.TransactionType == "PROVIDE");

                if (hasBeenProvided)
                {
                    throw new InvalidOperationException("Không thể xóa vì lô hàng đã được phân phát.");
                }

                // Xóa transaction detail liên quan
                var relatedDetails = await _context.TransactionDetails
                    .Where(td => td.ParentTransactionId == transactionId)
                    .ToListAsync();
                if (relatedDetails.Any())
                {
                    _context.TransactionDetails.RemoveRange(relatedDetails);
                }

                // Xóa transaction history
                var histories = await _context.TransactionHistories
                    .Where(h => h.TransactionId == transactionId)
                    .ToListAsync();
                if (histories.Any())
                {
                    _context.TransactionHistories.RemoveRange(histories);
                }

                // Xóa transaction
                _context.Transactions.Remove(transaction);

                await _context.SaveChangesAsync();
                await dbTrans.CommitAsync();
            }
            catch
            {
                await dbTrans.RollbackAsync();
                throw;
            }
        }

        public async Task<List<TransactionResponseDTO>> GetPendingProvideTransactionsForNurseAsync(string nurseId)
        {
            // 1. Lấy các RoomId mà y tá có lịch làm việc
            var today = DateTime.UtcNow.Date;
            var schedules = await _scheduleRepository.GetSchedulesByUserAndDateRangeAsync(
                nurseId,
                today,
                today // lấy từ hôm nay trở đi
            );

            var roomIds = schedules
                .Where(s => s.Role != null && s.Role.Equals("NURSE", StringComparison.OrdinalIgnoreCase))
                .Select(s => s.RoomId)
                .Distinct()
                .ToList();

            if (!roomIds.Any())
            {
                throw new ResourceNotFoundException("Không tìm thấy phòng nào trong lịch làm việc của y tá.");
            }

            // 2. Lấy các PROVIDE transaction PENDING cho các phòng này
            var transactions = await _context.Transactions
                .Include(t => t.Material)
                .ThenInclude(m => m.Supplier)
                .Include(t => t.User)
                .Where(t => t.TransactionType == "PROVIDE"
                    && t.Status == "PENDING"
                    && t.RoomId != null
                    && roomIds.Contains(t.RoomId))
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        
            if (!transactions.Any())
            {
                throw new ResourceNotFoundException("Không có lô hàng nào đang chờ duyệt cho các phòng trong lịch làm việc.");
            }

            // 3. Map sang DTO
            return transactions.Select(MapToResponseDTO).ToList();
        }
        public async Task<List<MaterialUsageHistoryDTO>> GetMaterialUsageHistoryAsync(
     string nurseId, DateTime? fromDate, DateTime? toDate)
        {
            var today = DateTime.UtcNow.Date;

            // Lấy danh sách phòng mà y tá đang trực hôm nay
            var schedules = await _scheduleRepository.GetSchedulesByUserAndDateRangeAsync(
                nurseId,
                today,
                today
            );

            var roomIds = schedules
                .Where(s => s.Role != null && s.Role.Equals("NURSE", StringComparison.OrdinalIgnoreCase))
                .Select(s => s.RoomId)
                .Distinct()
                .ToList();

            // Truy vấn lịch sử sử dụng vật tư
            var query = _context.TransactionHistories
                .Include(th => th.Transaction)
                    .ThenInclude(t => t.Material)
                        .ThenInclude(m => m.RoomMaterialStocks)
                .Where(th =>
                    th.Transaction.Material.RoomMaterialStocks.Any(rms => roomIds.Contains(rms.RoomId)) &&
                    (th.NewReason == "Y tá sử dụng" || th.OldReason == "Y tá sử dụng")
                );

            if (fromDate.HasValue)
                query = query.Where(th => th.ChangedAt >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(th => th.ChangedAt <= toDate.Value);

            var histories = await query
                .OrderByDescending(h => h.ChangedAt)
                .Select(h => new MaterialUsageHistoryDTO
                {
                    HistoryId = h.Id,
                    RoomId = h.Transaction.Material.RoomMaterialStocks
                        .FirstOrDefault(rms => roomIds.Contains(rms.RoomId)).RoomId,
                    MaterialId = h.Transaction.Material.Id,
                    MaterialName = h.Transaction.Material.Name,
                    OldQuantity = h.OldQuantity,
                    NewQuantity = h.NewQuantity,
                    QuantityUsed = h.OldQuantity - h.NewQuantity,
                    ChangedBy = h.ChangedBy,
                })
                .ToListAsync();

            return histories;
        }
        public async Task<List<ApproveRejectHistoryDTO>> GetApproveRejectHistoryAsync(string userId, DateTime? fromDate, DateTime? toDate)
        {
            var query = _context.TransactionHistories
                .Include(th => th.Transaction)
                    .ThenInclude(t => t.Material)
                .Where(th =>
                    th.ChangedBy == userId &&
                    (th.NewReason == "Được phê duyệt" || th.NewReason == "Bị từ chối")
                );

            if (fromDate.HasValue)
                query = query.Where(th => th.ChangedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(th => th.ChangedAt <= toDate.Value);

            var histories = await query
                .OrderByDescending(h => h.ChangedAt)
                .Select(h => new ApproveRejectHistoryDTO
                {
                    HistoryId = h.Id,
                    TransactionId = h.TransactionId,
                    MaterialId = h.Transaction.MaterialId,
                    MaterialName = h.Transaction.Material.Name,
                    Quantity = h.NewQuantity,
                    Action = h.NewReason, // "Được phê duyệt" hoặc "Bị từ chối"
                    ChangedBy = h.ChangedBy,
                    ChangedAt = h.ChangedAt
                })
                .ToListAsync();

            return histories;
        }





    }
}
