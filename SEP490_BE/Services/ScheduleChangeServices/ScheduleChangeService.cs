using Microsoft.EntityFrameworkCore;
using SEP490_BE.DTO.ScheduleChangeDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.ScheduleChangeRepositories;
using SEP490_BE.Repositories.ScheduleRepositories;
using SEP490_BE.Services.AuthServices;

namespace SEP490_BE.Services.ScheduleChangeServices
{
    public class ScheduleChangeRequestService : IScheduleChangeService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IScheduleChangeRepository _changeRequestRepository;
        private readonly IAuthService _authService;
        private readonly IAuditLogRepository _logRepository;

        public ScheduleChangeRequestService(
            KhanhAnNeurologyClinicContext context,
            IScheduleRepository scheduleRepository,
            IScheduleChangeRepository changeRequestRepository,
            IAuditLogRepository logRepository,
            IAuthService authService)
        {
            _context = context;
            _scheduleRepository = scheduleRepository;
            _changeRequestRepository = changeRequestRepository;
            _logRepository = logRepository;
            _authService = authService;
        }

        public async Task<ScheduleChangeResponseDTO> CreateRequest(string requesterId, CreateScheduleChangeDTO request)
        {
            var validRoles = new[] { "DOCTOR", "TECHNICIAN", "NURSE" };
           
            var requesterSchedule = await _scheduleRepository.FindByIdAsync(request.RequesterScheduleId);
            var requester = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == requesterId);
            if (requester == null || !requester.UserRoles.Any(ur => validRoles.Contains(ur.RoleName)))
            {
                throw new UnauthorizedAccessException("Chỉ những người dùng có vai trò là bác sĩ, kỹ thuật viên hoặc y tá mới được phép yêu cầu thay đổi lịch làm việc");
            }
            if (requesterSchedule == null || requesterSchedule.UserId != requesterId)
            {
                throw new ResourceNotFoundException("Không tìm thấy lịch làm việc tương ứng, hoặc người yêu cầu không có quyền sở hữu lịch này.");
            }
            var requesterRole = requester.UserRoles.First().RoleName;
            var targetUser = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == request.TargetUserId);
            if (targetUser == null || !targetUser.UserRoles.Any(ur => validRoles.Contains(ur.RoleName)))
            {
                throw new ResourceNotFoundException("Người dùng được chỉ định phải là bác sĩ, kỹ thuật viên hoặc y tá.");
            }
            var targetRole = targetUser.UserRoles.First().RoleName; 
            if (requesterRole != targetRole)
            {
                throw new UnauthorizedAccessException("Chỉ người dùng có cùng chức danh mới được phép đổi lịch với nhau.");
            }
            var targetSchedule = await _scheduleRepository.FindByIdAsync(request.TargetScheduleId);
            if (targetSchedule == null || targetSchedule.UserId != request.TargetUserId)
            {
                throw new ResourceNotFoundException("Không tìm thấy lịch làm việc của người được chỉ định hoặc lịch không thuộc quyền sở hữu của người đó.");
            }

            var requestEntity = new ScheduleChangeRequest
            {
                Id = Guid.NewGuid().ToString(),
                RequesterId = requesterId,
                RequesterScheduleId = request.RequesterScheduleId,
                TargetUserId = request.TargetUserId,
                TargetScheduleId = request.TargetScheduleId,
                Reason = request.Reason,
                Status = "PENDING"
            };
            var sessionUser = await _authService.GetAuthenticatedUser();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _changeRequestRepository.AddAsync(requestEntity);
                await _context.SaveChangesAsync();
                await _logRepository.LogAsync(sessionUser.Id, "CREATE", "ScheduleChangeRequests", requestEntity.Id, null, requestEntity);
                await transaction.CommitAsync();

                var createdRequest = await _changeRequestRepository.FindByIdAsync(requestEntity.Id);
                return new ScheduleChangeResponseDTO
                {
                    Id = createdRequest.Id,
                    RequesterId = createdRequest.RequesterId,
                    RequesterScheduleId = createdRequest.RequesterScheduleId,
                    TargetUserId = createdRequest.TargetUserId,
                    TargetScheduleId = createdRequest.TargetScheduleId,
                    Reason = createdRequest.Reason,
                    Status = createdRequest.Status,
                    RequesterName = createdRequest.Requester?.Name,
                    TargetUserName = createdRequest.TargetUser?.Name
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<ScheduleChangeResponseDTO> ApproveRequest(string requestId)
        {
            var request = await _changeRequestRepository.FindByIdAsync(requestId);
            if (request == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy yêu cầu.");
            }
            if (request.Status != "PENDING")
            {
                throw new InvalidOperationException("Yêu cầu không ở trạng thái chờ.");
            }

            var requesterSchedule = await _scheduleRepository.FindByIdAsync(request.RequesterScheduleId);
            var targetSchedule = await _scheduleRepository.FindByIdAsync(request.TargetScheduleId);

            if (requesterSchedule == null || targetSchedule == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy lịch làm việc liên quan.");
            }

            var tempUserId = requesterSchedule.UserId;
            requesterSchedule.UserId = targetSchedule.UserId;
            targetSchedule.UserId = tempUserId;

            request.Status = "APPROVED";
            var sessionUser = await _authService.GetAuthenticatedUser();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _scheduleRepository.UpdateAsync(requesterSchedule);
                await _scheduleRepository.UpdateAsync(targetSchedule);
                await _changeRequestRepository.UpdateAsync(request);
                await _context.SaveChangesAsync();
                await _logRepository.LogAsync(sessionUser.Id, "APPROVE", "ScheduleChangeRequests", request.Id, null, request);
                await transaction.CommitAsync();

                var updatedRequest = await _changeRequestRepository.FindByIdAsync(request.Id);
                return new ScheduleChangeResponseDTO
                {
                    Id = updatedRequest.Id,
                    RequesterId = updatedRequest.RequesterId,
                    RequesterScheduleId = updatedRequest.RequesterScheduleId,
                    TargetUserId = updatedRequest.TargetUserId,
                    TargetScheduleId = updatedRequest.TargetScheduleId,
                    Reason = updatedRequest.Reason,
                    Status = updatedRequest.Status,
                    RequesterName = updatedRequest.Requester?.Name,
                    TargetUserName = updatedRequest.TargetUser?.Name
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<ScheduleChangeResponseDTO> RejectRequest(string requestId)
        {
            var request = await _changeRequestRepository.FindByIdAsync(requestId);
            if (request == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy yêu cầu.");
            }
            if (request.Status != "PENDING")
            {
                throw new InvalidOperationException("Yêu cầu không ở trạng thái chờ.");
            }

            request.Status = "REJECTED";
            var sessionUser = await _authService.GetAuthenticatedUser();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _changeRequestRepository.UpdateAsync(request);
                await _context.SaveChangesAsync();
                await _logRepository.LogAsync(sessionUser.Id, "REJECT", "ScheduleChangeRequests", request.Id, null, request);
                await transaction.CommitAsync();

                var updatedRequest = await _changeRequestRepository.FindByIdAsync(request.Id);
                return new ScheduleChangeResponseDTO
                {
                    Id = updatedRequest.Id,
                    RequesterId = updatedRequest.RequesterId,
                    RequesterScheduleId = updatedRequest.RequesterScheduleId,
                    TargetUserId = updatedRequest.TargetUserId,
                    TargetScheduleId = updatedRequest.TargetScheduleId,
                    Reason = updatedRequest.Reason,
                    Status = updatedRequest.Status,
                    RequesterName = updatedRequest.Requester?.Name,
                    TargetUserName = updatedRequest.TargetUser?.Name
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<ScheduleChangeResponseDTO> GetRequestById(string requestId)
        {
            var request = await _changeRequestRepository.FindByIdAsync(requestId);
            if (request == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy yêu cầu.");
            }

            return new ScheduleChangeResponseDTO
            {
                Id = request.Id,
                Reason = request.Reason,
                Status = request.Status,
                RequesterId = request.RequesterId,
                TargetUserId = request.TargetUserId,
                RequesterScheduleId = request.RequesterScheduleId,
                TargetScheduleId = request.TargetScheduleId,
                RequesterName = request.Requester?.Name,
                TargetUserName = request.TargetUser?.Name,
                RequesterDate = request.RequesterSchedule.Date,
                RequesterTimeSlotId = request.RequesterSchedule.TimeSlotId,
                TargetDate = request.TargetSchedule.Date,
                TargetTimeSlotId = request.TargetSchedule.TimeSlotId
            };
        }
        public async Task<List<ScheduleChangeResponseDTO>> GetByRequesterIdAsync(string requesterId)
        {
            var requests = await _changeRequestRepository.GetByRequesterIdAsync(requesterId);
            if (requests == null || !requests.Any())
            {
                throw new ResourceNotFoundException("Không tìm thấy yêu cầu.");
            }
            return requests.Select(MapToDto).ToList();
        }

        public async Task<List<ScheduleChangeResponseDTO>> GetByTargetUserIdAsync(string targetUserId)
        {
            var requests = await _changeRequestRepository.GetByTargetUserIdAsync(targetUserId);
            if (requests == null || !requests.Any())
            {
                throw new ResourceNotFoundException("Không tìm thấy yêu cầu.");
            }
            return requests.Select(MapToDto).ToList();
        }
        private ScheduleChangeResponseDTO MapToDto(ScheduleChangeRequest r)
        {
            return new ScheduleChangeResponseDTO
            {
                Id = r.Id,
                Reason = r.Reason,
                Status = r.Status,
                RequesterId = r.RequesterId,
                TargetUserId = r.TargetUserId,
                RequesterScheduleId = r.RequesterScheduleId,
                TargetScheduleId = r.TargetScheduleId,
                RequesterName = r.Requester?.Name,
                TargetUserName = r.TargetUser?.Name,
                RequesterDate = r.RequesterSchedule.Date ,
                RequesterTimeSlotId = r.RequesterSchedule.TimeSlotId ,
                TargetDate = r.TargetSchedule.Date ,
                TargetTimeSlotId = r.TargetSchedule.TimeSlotId 
            };
        }
    }
}
