using Microsoft.EntityFrameworkCore;
using SEP490_BE.DTO.ScheduleChangeDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.ScheduleChangeRepositories;
using SEP490_BE.Repositories.ScheduleRepositories;

namespace SEP490_BE.Services.ScheduleChangeServices
{
    public class ScheduleChangeRequestService : IScheduleChangeService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IScheduleChangeRepository _changeRequestRepository;

        public ScheduleChangeRequestService(
            KhanhAnNeurologyClinicContext context,
            IScheduleRepository scheduleRepository,
            IScheduleChangeRepository changeRequestRepository)
        {
            _context = context;
            _scheduleRepository = scheduleRepository;
            _changeRequestRepository = changeRequestRepository;
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
                throw new UnauthorizedAccessException("Only doctors, technicians, or nurses can request schedule changes.");
            }
            if (requesterSchedule == null || requesterSchedule.UserId != requesterId)
            {
                throw new ResourceNotFoundException("Requester schedule not found or not owned by requester.");
            }
            var requesterRole = requester.UserRoles.First().RoleName;
            var targetUser = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == request.TargetUserId);
            if (targetUser == null || !targetUser.UserRoles.Any(ur => validRoles.Contains(ur.RoleName)))
            {
                throw new ResourceNotFoundException("Target user must be a doctor, technician, or nurse.");
            }
            var targetRole = targetUser.UserRoles.First().RoleName; 
            if (requesterRole != targetRole)
            {
                throw new UnauthorizedAccessException("Only users with the same role can swap schedules.");
            }
            var targetSchedule = await _scheduleRepository.FindByIdAsync(request.TargetScheduleId);
            if (targetSchedule == null || targetSchedule.UserId != request.TargetUserId)
            {
                throw new ResourceNotFoundException("Target schedule not found or not owned by target user.");
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

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _changeRequestRepository.AddAsync(requestEntity);
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
                throw new ResourceNotFoundException("Request not found.");
            }
            if (request.Status != "PENDING")
            {
                throw new InvalidOperationException("Request is not pending.");
            }

            var requesterSchedule = await _scheduleRepository.FindByIdAsync(request.RequesterScheduleId);
            var targetSchedule = await _scheduleRepository.FindByIdAsync(request.TargetScheduleId);

            if (requesterSchedule == null || targetSchedule == null)
            {
                throw new ResourceNotFoundException("Associated schedules not found.");
            }

            var tempUserId = requesterSchedule.UserId;
            requesterSchedule.UserId = targetSchedule.UserId;
            targetSchedule.UserId = tempUserId;

            request.Status = "APPROVED";

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _scheduleRepository.UpdateAsync(requesterSchedule);
                await _scheduleRepository.UpdateAsync(targetSchedule);
                await _changeRequestRepository.UpdateAsync(request);
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
                throw new ResourceNotFoundException("Request not found.");
            }
            if (request.Status != "PENDING")
            {
                throw new InvalidOperationException("Request is not pending.");
            }

            request.Status = "REJECTED";

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _changeRequestRepository.UpdateAsync(request);
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
                throw new ResourceNotFoundException("Request not found.");
            }

            return new ScheduleChangeResponseDTO
            {
                Id = request.Id,
                RequesterId = request.RequesterId,
                RequesterScheduleId = request.RequesterScheduleId,
                TargetUserId = request.TargetUserId,
                TargetScheduleId = request.TargetScheduleId,
                Reason = request.Reason,
                Status = request.Status,
                RequesterName = request.Requester?.Name,
                TargetUserName = request.TargetUser?.Name
            };
        }
    }
}
