using Microsoft.EntityFrameworkCore;
using SEP490_BE.DTO.ScheduleDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.ScheduleRepositories;

namespace SEP490_BE.Services.ScheduleServices
{
    public class ScheduleService : IScheduleService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IScheduleRepository _scheduleRepository;

        public ScheduleService(
            KhanhAnNeurologyClinicContext context,
            IScheduleRepository scheduleRepository)
        {
            _context = context;
            _scheduleRepository = scheduleRepository;
        }

        public async Task<List<ScheduleResponseDTO>> GetSchedulesByUserId(string userId, DateTime fromDate, DateTime toDate)
        {
            if (fromDate > toDate)
            {
                throw new Exceptions.ArgumentException("FromDate must be before or equal to ToDate.");
            }

            var schedules = await _scheduleRepository.GetSchedulesByUserAndDateRangeAsync(userId, fromDate, toDate);
            return schedules.Select(s => new ScheduleResponseDTO
            {
                Id = s.Id,
                UserId = s.UserId,
                Role = s.Role,
                RoomId = s.RoomId,
                RoomType = s.RoomType,
                Date = s.Date,
                TimeSlotId = s.TimeSlotId,
                Status = s.Status
            }).ToList();
        }

        public async Task<List<ScheduleResponseDTO>> GetSchedulesByRoomId(string roomId, DateTime fromDate, DateTime toDate)
        {
            if (fromDate > toDate)
            {
                throw new Exceptions.ArgumentException("FromDate must be before or equal to ToDate.");
            }

            var schedules = await _scheduleRepository.GetSchedulesByRoomAndDateRangeAsync(roomId, fromDate, toDate);
            return schedules.Select(s => new ScheduleResponseDTO
            {
                Id = s.Id,
                UserId = s.UserId,
                Role = s.Role,
                RoomId = s.RoomId,
                RoomType = s.RoomType,
                Date = s.Date,
                TimeSlotId = s.TimeSlotId,
                Status = s.Status
            }).ToList();
        }

        public async Task<List<ScheduleResponseDTO>> GetAllSchedules(DateTime fromDate, DateTime toDate)
        {
            if (fromDate > toDate)
            {
                throw new Exceptions.ArgumentException("FromDate must be before or equal to ToDate.");
            }

            var schedules = await _scheduleRepository.GetAllSchedulesByDateRangeAsync(fromDate, toDate);
            return schedules.Select(s => new ScheduleResponseDTO
            {
                Id = s.Id,
                UserId = s.UserId,
                Role = s.Role,
                RoomId = s.RoomId,
                RoomType = s.RoomType,
                Date = s.Date,
                TimeSlotId = s.TimeSlotId,
                Status = s.Status
            }).ToList();
        }

        public async Task<List<ScheduleResponseDTO>> CreateScheduleRange(CreateScheduleRangeDTO request)
        {
      
            // Kiểm tra user tồn tại và role khớp
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == request.UserId);
            if (user == null || !user.UserRoles.Any(ur => ur.RoleName == request.Role))
            {
                throw new ResourceNotFoundException("User or role not found.");
            }

            var room = await DetectRoomTypeAsync(request.RoomId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Room not found.");
            }

            // Kiểm tra TimeSlot tồn tại
            var timeSlot = await _context.TimeSlots.FindAsync(request.TimeSlotId);
            if (timeSlot == null)
            {
                throw new ResourceNotFoundException("Time slot not found.");
            }

            var schedules = new List<Schedule>();
            var currentDate = request.FromDate.Date;
            while (currentDate <= request.ToDate.Date)
            {
                if (await _scheduleRepository.CheckScheduleConflictAsync(request.UserId, currentDate))
                {
                    currentDate = currentDate.AddDays(1);
                    continue;
                }

                var schedule = new Schedule
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = request.UserId,
                    Role = request.Role,
                    RoomId = request.RoomId,
                    RoomType = request.RoomType,
                    Date = currentDate,
                    TimeSlotId = request.TimeSlotId,
                    Status = "SCHEDULED"
                };
                schedules.Add(schedule);
                currentDate = currentDate.AddDays(1);
            }

            if (!schedules.Any())
            {
                return new List<ScheduleResponseDTO>();
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _scheduleRepository.InsertRangeAsync(schedules);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return schedules.Select(s => new ScheduleResponseDTO
            {
                Id = s.Id,
                UserId = s.UserId,
                Role = s.Role,
                RoomId = s.RoomId,
                RoomType = s.RoomType,
                Date = s.Date,
                TimeSlotId = s.TimeSlotId,
                Status = s.Status
            }).ToList();
        }
        public async Task<ScheduleResponseDTO> CreateSchedule(CreateScheduleDTO request)
        {
           
   

            if (string.IsNullOrEmpty(request.UserId))
            {
                throw new Exceptions.ArgumentException("UserId is required.");
            }
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == request.UserId);
            if (user == null )
            {
                throw new ResourceNotFoundException("User not found.");
            }

            var room = await DetectRoomTypeAsync(request.RoomId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Room not found.");
            }

            if (string.IsNullOrEmpty(request.TimeSlotId))
            {
                throw new Exceptions.ArgumentException("TimeSlotId is required.");
            }
            var timeSlot = await _context.TimeSlots.FindAsync(request.TimeSlotId);
            if (timeSlot == null)
            {
                throw new ResourceNotFoundException("Time slot not found.");
            }

            if (await _scheduleRepository.CheckScheduleConflictAsync(request.UserId, request.Date))
            {
                throw new ResourceNotFoundException("Schedule conflict detected for this user on the specified date.");
            }

            var schedule = new Schedule
            {
                Id = Guid.NewGuid().ToString(),
                UserId = request.UserId,
                Role = user.UserRoles.First().RoleName,
                RoomId = request.RoomId,
                RoomType = room,
                Date = request.Date,
                TimeSlotId = request.TimeSlotId,
                Status = "SCHEDULED"
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _scheduleRepository.InsertRangeAsync(new List<Schedule> { schedule });
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new ScheduleResponseDTO
            {
                Id = schedule.Id,
                UserId = schedule.UserId,
                Role = schedule.Role,
                RoomId = schedule.RoomId,
                RoomType = schedule.RoomType,
                Date = schedule.Date,
                TimeSlotId = schedule.TimeSlotId,
                Status = schedule.Status
            };
        }
        public async Task<ScheduleResponseDTO> UpdateSchedule(string id, UpdateScheduleDTO request)
        {
       

            var schedule = await _scheduleRepository.FindByIdAsync(id);
            if (schedule == null)
            {
                throw new ResourceNotFoundException("Schedule not found.");
            }

            if (request.RoomId != null)
            {
                var room = await DetectRoomTypeAsync(request.RoomId);
                if (room == null)
                {
                    throw new ResourceNotFoundException("New room not found.");
                }
                schedule.RoomId = request.RoomId;
                schedule.RoomType = room is ExaminationRoom ? "EXAMINATION" : "LABORATORY";
            }

            if (request.TimeSlotId != null)
            {
                var timeSlot = await _context.TimeSlots.FindAsync(request.TimeSlotId);
                if (timeSlot == null)
                {
                    throw new ResourceNotFoundException("New time slot not found.");
                }
                schedule.TimeSlotId = request.TimeSlotId;
            }

            if (request.Status != null && Enum.TryParse<ScheduleStatus>(request.Status, true, out var status))
            {
                schedule.Status = request.Status;
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _scheduleRepository.UpdateAsync(schedule);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new ScheduleResponseDTO
            {
                Id = schedule.Id,
                UserId = schedule.UserId,
                Role = schedule.Role,
                RoomId = schedule.RoomId,
                RoomType = schedule.RoomType,
                Date = schedule.Date,
                TimeSlotId = schedule.TimeSlotId,
                Status = schedule.Status
            };
        }

        public async Task DeleteSchedule(string id)
        {
           

            var schedule = await _scheduleRepository.FindByIdAsync(id);
            if (schedule == null)
            {
                throw new ResourceNotFoundException("Schedule not found.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _scheduleRepository.DeleteAsync(id);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        private async Task<string> DetectRoomTypeAsync(string roomId)
        {
            if (await _context.ExaminationRooms.AnyAsync(r => r.Id == roomId))
                return "EXAMINATION";

            if (await _context.LaboratoryRooms.AnyAsync(r => r.Id == roomId))
                return "LABORATORY";

            throw new ResourceNotFoundException("Room not found.");
        }

    }
    public enum ScheduleStatus
    {
        SCHEDULED,
        PRESENT,
        ABSENT
    }
}
