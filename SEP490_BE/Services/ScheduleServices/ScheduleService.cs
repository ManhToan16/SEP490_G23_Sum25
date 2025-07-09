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
      
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == request.UserId);
            if (user == null )
            {
                throw new ResourceNotFoundException("User  not found.");
            }

            var userRole = user.UserRoles.First().RoleName;

            if (request.ScheduleAssignments == null || !request.ScheduleAssignments.Any())
            {
                throw new Exceptions.ArgumentException("ScheduleAssignments is required and must contain at least one assignment.");
            }

            var assignments = request.ScheduleAssignments.OrderBy(a => a.Date).ToList();
            if (assignments.Any() && assignments.First().Date > assignments.Last().Date)
            {
                throw new Exceptions.ArgumentException("Schedule assignments must be in chronological order.");
            }
            var schedules = new List<Schedule>();
            var currentDate = assignments.First().Date.Date;
            var assignmentIndex = 0;

            while (currentDate <= assignments.Last().Date.Date)
            {
                if (await _scheduleRepository.CheckScheduleConflictAsync(request.UserId, currentDate))
                {
                    currentDate = currentDate.AddDays(1);
                    continue;
                }

                string roomId, timeSlotId;
                if (assignmentIndex < assignments.Count && assignments[assignmentIndex].Date.Date == currentDate)
                {
                    roomId = assignments[assignmentIndex].RoomId;
                    timeSlotId = assignments[assignmentIndex].TimeSlotId;
                    assignmentIndex++;
                }
                else
                {
                   
                        throw new Exceptions.ArgumentException($"No assignment for date {currentDate}.");
                  
                }

                var roomType = await DetectRoomTypeAsync(roomId);
                if (roomType == null)
                {
                    throw new ResourceNotFoundException("Room not found.");
                }

                if (!IsValidRoleForRoomType(roomType, userRole))
                {
                    throw new UnauthorizedAccessException($"Role {userRole} is not allowed for {roomType} room.");
                }

                var timeSlot = await _context.TimeSlots.FindAsync(timeSlotId);
                if (timeSlot == null)
                {
                    throw new ResourceNotFoundException("Time slot not found.");
                }

                var existingSchedules = await _scheduleRepository.GetSchedulesByRoomAndDateRangeAsync(roomId, currentDate, currentDate);
                var existingSlotSchedules = existingSchedules.Where(s => s.TimeSlotId == timeSlotId).ToList();
                if (roomType == "EXAMINATION")
                {
                    var doctorCount = existingSlotSchedules.Count(s => s.Role == "DOCTOR");
                    var nurseCount = existingSlotSchedules.Count(s => s.Role == "NURSE");
                    if (doctorCount > 0 && nurseCount > 0)
                    {
                        throw new ConflictDataException("Examination room can only have one DOCTOR and one NURSE per TimeSlot.");
                    }
                    if (doctorCount > 0 && userRole == "DOCTOR" ||
                        nurseCount > 0 && userRole == "NURSE")
                    {
                        throw new ConflictDataException($"Examination room already has a {userRole} for this TimeSlot on {currentDate}.");
                    }
                }
                else if (roomType == "LABORATORY")
                {
                    var techCount = existingSlotSchedules.Count(s => s.Role == "TECHNICIAN");
                    var nurseCount = existingSlotSchedules.Count(s => s.Role == "NURSE");
                    if (techCount > 0 && nurseCount > 0)
                    {
                        throw new ConflictDataException("Laboratory room can only have one TECHNICIAN and one NURSE per TimeSlot.");
                    }
                    if (techCount > 0 && userRole == "TECHNICIAN" ||
                        nurseCount > 0 && userRole == "NURSE")
                    {
                        throw new ConflictDataException($"Laboratory room already has a {userRole} for this TimeSlot on {currentDate}.");
                    }
                }

                var schedule = new Schedule
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = request.UserId,
                    Role = userRole,
                    RoomId = roomId,
                    RoomType = roomType,
                    Date = currentDate,
                    TimeSlotId = timeSlotId,
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
            var userRole = user.UserRoles.First().RoleName;
            if (!IsValidRoleForRoomType(room, userRole))
            {
                throw new UnauthorizedAccessException($"Role {userRole} is not allowed for {room} room.");
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
            var existingSchedules = await _scheduleRepository.GetSchedulesByRoomAndDateRangeAsync(request.RoomId, request.Date, request.Date);
            var existingSlotSchedules = existingSchedules.Where(s => s.TimeSlotId == request.TimeSlotId).ToList();
            if (room == "EXAMINATION")
            {
                var doctorCount = existingSlotSchedules.Count(s => s.Role == "DOCTOR");
                var nurseCount = existingSlotSchedules.Count(s => s.Role == "NURSE");
                if (doctorCount > 0 && nurseCount > 0)
                {
                    throw new ConflictDataException("Examination room can only have one DOCTOR and one NURSE per TimeSlot.");
                }
                if (doctorCount > 0 && user.UserRoles.First().RoleName == "DOCTOR" ||
                    nurseCount > 0 && user.UserRoles.First().RoleName == "NURSE")
                {
                    throw new ConflictDataException($"Examination room already has a {user.UserRoles.First().RoleName} for this TimeSlot on {request.Date}.");
                }
            }
            else if (room == "LABORATORY")
            {
                var techCount = existingSlotSchedules.Count(s => s.Role == "TECHNICIAN");
                var nurseCount = existingSlotSchedules.Count(s => s.Role == "NURSE");
                if (techCount > 0 && nurseCount > 0)
                {
                    throw new ConflictDataException("Laboratory room can only have one TECHNICIAN and one NURSE per TimeSlot.");
                }
                if (techCount > 0 && user.UserRoles.First().RoleName == "TECHNICIAN" ||
                    nurseCount > 0 && user.UserRoles.First().RoleName == "NURSE")
                {
                    throw new ConflictDataException($"Laboratory room already has a {user.UserRoles.First().RoleName} for this TimeSlot on {request.Date}.");
                }
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
        private bool IsValidRoleForRoomType(string roomType, string role)
        {
            if (roomType == "EXAMINATION")
            {
                return role == "DOCTOR" || role == "NURSE";
            }
            else if (roomType == "LABORATORY")
            {
                return role == "TECHNICIAN" || role == "NURSE";
            }
            return false;
        }
    }
    public enum ScheduleStatus
    {
        SCHEDULED,
        PRESENT,
        ABSENT
    }
}
