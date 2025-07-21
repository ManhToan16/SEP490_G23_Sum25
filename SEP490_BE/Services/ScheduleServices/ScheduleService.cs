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
                throw new Exceptions.ArgumentException("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
            }

            var schedules = await _scheduleRepository.GetSchedulesByUserAndDateRangeAsync(userId, fromDate, toDate);
            var result = new List<ScheduleResponseDTO>();

            foreach (var s in schedules)
            {
                var dto = new ScheduleResponseDTO
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    UserName = s.User.Name,
                    Role = s.Role,
                    RoomId = s.RoomId,
                    RoomName = await GetRoomNameAsync(s.RoomId),
                    RoomType = s.RoomType,
                    Date = s.Date.ToLocalTime().ToString("dd/MM/yyyy"),
                    TimeSlotId = s.TimeSlotId,
                    Status = s.Status
                };
                result.Add(dto);
            }

            return result;
        }

        public async Task<List<ScheduleResponseDTO>> GetSchedulesByRoomId(string roomId, DateTime fromDate, DateTime toDate)
        {
            if (fromDate > toDate)
            {
                throw new Exceptions.ArgumentException("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
            }

            var schedules = await _scheduleRepository.GetSchedulesByRoomAndDateRangeAsync(roomId, fromDate, toDate);
            var result = new List<ScheduleResponseDTO>();

            foreach (var s in schedules)
            {
                var dto = new ScheduleResponseDTO
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    UserName = s.User.Name,
                    Role = s.Role,
                    RoomId = s.RoomId,
                    RoomName = await GetRoomNameAsync(s.RoomId),
                    RoomType = s.RoomType,
                    Date = s.Date.ToLocalTime().ToString("dd/MM/yyyy"),
                    TimeSlotId = s.TimeSlotId,
                    Status = s.Status
                };
                result.Add(dto);
            }

            return result;
        }
        public async Task<List<ScheduleResponseDTO>> GetSchedulesByRole(string role, DateTime fromDate, DateTime toDate)
        {
            if (fromDate > toDate)
            {
                throw new Exceptions.ArgumentException("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
            }

            var schedules = await _scheduleRepository.GetSchedulesByRoleAndDateRangeAsync(role, fromDate, toDate);
            var result = new List<ScheduleResponseDTO>();

            foreach (var s in schedules)
            {
                var dto = new ScheduleResponseDTO
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    UserName = s.User.Name,
                    Role = s.Role,
                    RoomId = s.RoomId,
                    RoomName = await GetRoomNameAsync(s.RoomId),
                    RoomType = s.RoomType,
                    Date = s.Date.ToLocalTime().ToString("dd/MM/yyyy"),
                    TimeSlotId = s.TimeSlotId,
                    Status = s.Status
                };
                result.Add(dto);
            }

            return result;
        }

        public async Task<List<ScheduleResponseDTO>> GetAllSchedules(DateTime fromDate, DateTime toDate)
        {
            if (fromDate > toDate)
            {
                throw new Exceptions.ArgumentException("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
            }

            var schedules = await _scheduleRepository.GetAllSchedulesByDateRangeAsync(fromDate, toDate);
            var result = new List<ScheduleResponseDTO>();

            foreach (var s in schedules)
            {
                var dto = new ScheduleResponseDTO
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    UserName = s.User.Name,
                    Role = s.Role,
                    RoomId = s.RoomId,
                    RoomName = await GetRoomNameAsync(s.RoomId),
                    RoomType = s.RoomType,
                    Date = s.Date.ToLocalTime().ToString("dd/MM/yyyy"),
                    TimeSlotId = s.TimeSlotId,
                    Status = s.Status
                };
                result.Add(dto);
            }

            return result;
        }

        public async Task<List<ScheduleResponseDTO>> CreateScheduleRange(CreateScheduleRangeDTO request)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == request.UserId);
            if (user == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy người dùng.");
            }

            var userRole = user.UserRoles.First().RoleName;

            if (request.ScheduleAssignments == null || !request.ScheduleAssignments.Any())
            {
                throw new Exceptions.ArgumentException("Phân công lịch làm việc là bắt buộc và phải chứa ít nhất một phân công.");
            }

            var schedules = new List<Schedule>();

            foreach (var assignment in request.ScheduleAssignments.OrderBy(a => a.Date))
            {
                var date = assignment.Date.Date;
                var hasSameTimeSlot = await _context.Schedules.AnyAsync(s =>
                    s.UserId == request.UserId &&
                    s.Date == date &&
                    s.TimeSlotId == assignment.TimeSlotId);

                if (hasSameTimeSlot)
                {
                    throw new ConflictDataException($"Người dùng đã có lịch cho khung giờ này vào ngày {date:yyyy-MM-dd}.");
                }

                var roomType = await DetectRoomTypeAsync(assignment.RoomId);
                if (roomType == null)
                {
                    throw new ResourceNotFoundException("Không tìm thấy phòng.");
                }

                if (!IsValidRoleForRoomType(roomType, userRole))
                {
                    throw new UnauthorizedAccessException($"Role {userRole} không được phép vào phòng {roomType}.");
                }

                var timeSlot = await _context.TimeSlots.FindAsync(assignment.TimeSlotId);
                if (timeSlot == null)
                {
                    throw new ResourceNotFoundException("Không tìm thấy khoảng thời gian.");
                }

                var existingSchedules = await _scheduleRepository.GetSchedulesByRoomAndDateRangeAsync(assignment.RoomId, date, date);
                var existingSlotSchedules = existingSchedules.Where(s => s.TimeSlotId == assignment.TimeSlotId).ToList();

                if (roomType == "EXAMINATION")
                {
                    var doctorCount = existingSlotSchedules.Count(s => s.Role == "DOCTOR");
                    var nurseCount = existingSlotSchedules.Count(s => s.Role == "NURSE");
                    if ((userRole == "DOCTOR" && doctorCount > 0) ||
                        (userRole == "NURSE" && nurseCount > 0))
                    {
                        throw new ConflictDataException($"Phòng khám đã có một {userRole} cho khung giờ này vào ngày {date:yyyy-MM-dd}.");
                    }
                    if (doctorCount > 0 && nurseCount > 0)
                    {
                        throw new ConflictDataException("Phòng khám chỉ được phép có một BÁC SĨ và một Y TÁ cho mỗi khung giờ.");
                    }
                }
                else if (roomType == "LABORATORY")
                {
                    var techCount = existingSlotSchedules.Count(s => s.Role == "TECHNICIAN");
                    var nurseCount = existingSlotSchedules.Count(s => s.Role == "NURSE");
                    if ((userRole == "TECHNICIAN" && techCount > 0) ||
                        (userRole == "NURSE" && nurseCount > 0))
                    {
                        throw new ConflictDataException($"Phòng xét nghiệm đã có một {userRole} cho khung giờ này vào ngày {date:yyyy-MM-dd}.");
                    }
                    if (techCount > 0 && nurseCount > 0)
                    {
                        throw new ConflictDataException("Phòng xét nghiệm chỉ được phép có một KỸ THUẬT VIÊN và một Y TÁ cho mỗi khung giờ.");
                    }
                }

                var schedule = new Schedule
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = request.UserId,
                    Role = userRole,
                    RoomId = assignment.RoomId,
                    RoomType = roomType,
                    Date = date,
                    TimeSlotId = assignment.TimeSlotId,
                    Status = "SCHEDULED"
                };

                schedules.Add(schedule);
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

            return await Task.WhenAll(schedules.Select(async s => new ScheduleResponseDTO
            {
                Id = s.Id,
                UserId = s.UserId,
                UserName = user.Name, // Đã có sẵn user
                Role = s.Role,
                RoomId = s.RoomId,
                RoomName = await GetRoomNameAsync(s.RoomId), // Gọi async từng phòng
                RoomType = s.RoomType,
                Date = s.Date.ToLocalTime().ToString("dd/MM/yyyy"),
                TimeSlotId = s.TimeSlotId,
                Status = s.Status
            })).ContinueWith(t => t.Result.ToList());

        }

        public async Task<ScheduleResponseDTO> CreateSchedule(CreateScheduleDTO request)
        {
           

            if (string.IsNullOrEmpty(request.UserId))
            {
                throw new Exceptions.ArgumentException("UserId được yêu cầu");
            }
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == request.UserId);
            if (user == null )
            {
                throw new ResourceNotFoundException("Không thấy người dùng.");
            }

            var room = await DetectRoomTypeAsync(request.RoomId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy phòng.");
            }
            var userRole = user.UserRoles.First().RoleName;
            if (!IsValidRoleForRoomType(room, userRole))
            {
                throw new UnauthorizedAccessException($"Role {userRole} không có quyền truy cập phòng {room}.");
            }
            if (string.IsNullOrEmpty(request.TimeSlotId))
            {
                throw new Exceptions.ArgumentException("TimeSlotId được yêu cầu.");
            }
            var timeSlot = await _context.TimeSlots.FindAsync(request.TimeSlotId);
            if (timeSlot == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy khoảng thời gian.");
            }

            var hasSameTimeSlot = await _context.Schedules.AnyAsync(s =>
       s.UserId == request.UserId &&
       s.Date == request.Date &&
       s.TimeSlotId == request.TimeSlotId);

            if (hasSameTimeSlot)
            {
                throw new ConflictDataException("Người dùng này đã có lịch làm việc cho khung giờ này vào ngày được chọn.");
            }

            var existingSchedules = await _scheduleRepository.GetSchedulesByRoomAndDateRangeAsync(request.RoomId, request.Date, request.Date);
            var existingSlotSchedules = existingSchedules.Where(s => s.TimeSlotId == request.TimeSlotId).ToList();
            if (room == "EXAMINATION")
            {
                var doctorCount = existingSlotSchedules.Count(s => s.Role == "DOCTOR");
                var nurseCount = existingSlotSchedules.Count(s => s.Role == "NURSE");
                if (doctorCount > 0 && nurseCount > 0)
                {
                    throw new ConflictDataException("Phòng khám lâm sàng chỉ được phép có một BÁC SĨ và một Y TÁ cho mỗi khung giờ.");
                }
                if (doctorCount > 0 && user.UserRoles.First().RoleName == "DOCTOR" ||
                    nurseCount > 0 && user.UserRoles.First().RoleName == "NURSE")
                {
                    throw new ConflictDataException($"Phòng khám lâm sàng đã có một {user.UserRoles.First().RoleName} cho khoảng thời gian này vào ngày {request.Date}.");
                }
            }
            else if (room == "LABORATORY")
            {
                var techCount = existingSlotSchedules.Count(s => s.Role == "TECHNICIAN");
                var nurseCount = existingSlotSchedules.Count(s => s.Role == "NURSE");
                if (techCount > 0 && nurseCount > 0)
                {
                    throw new ConflictDataException("Phòng xét nghiệm chỉ được phép có một KỸ THUẬT VIÊN và một Y TÁ cho mỗi khung giờ.");
                }
                if (techCount > 0 && user.UserRoles.First().RoleName == "TECHNICIAN" ||
                    nurseCount > 0 && user.UserRoles.First().RoleName == "NURSE")
                {
                    throw new ConflictDataException($"Phòng khám xét nghiệm đã có một {user.UserRoles.First().RoleName} cho khoảng thời gian này vào ngày {request.Date}.");
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
                UserName = user.Name, // user đã có
                Role = schedule.Role,
                RoomId = schedule.RoomId,
                RoomName = await GetRoomNameAsync(schedule.RoomId), // async
                RoomType = schedule.RoomType,
                Date = schedule.Date.ToLocalTime().ToString("dd/MM/yyyy"),
                TimeSlotId = schedule.TimeSlotId,
                Status = schedule.Status
            };

        }
        public async Task<ScheduleResponseDTO> UpdateSchedule(string id, UpdateScheduleDTO request)
        {
       

            var schedule = await _scheduleRepository.FindByIdAsync(id);
            if (schedule == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy lịch.");
            }

            if (request.RoomId != null)
            {
                var room = await DetectRoomTypeAsync(request.RoomId);
                if (room == null)
                {
                    throw new ResourceNotFoundException("Không tìm thấy phòng mới.");
                }
                schedule.RoomId = request.RoomId;
                schedule.RoomType = room is ExaminationRoom ? "EXAMINATION" : "LABORATORY";
            }

            if (request.TimeSlotId != null)
            {
                var timeSlot = await _context.TimeSlots.FindAsync(request.TimeSlotId);
                if (timeSlot == null)
                {
                    throw new ResourceNotFoundException(" Không tìm thấy khoảng thời gian mới");
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
                UserName = schedule.User.Name, 
                Role = schedule.Role,
                RoomId = schedule.RoomId,
                RoomName = await GetRoomNameAsync(schedule.RoomId), // async
                RoomType = schedule.RoomType,
                Date = schedule.Date.ToLocalTime().ToString("dd/MM/yyyy"),
                TimeSlotId = schedule.TimeSlotId,
                Status = schedule.Status
            };

        }

        public async Task DeleteSchedule(string id)
        {
           

            var schedule = await _scheduleRepository.FindByIdAsync(id);
            if (schedule == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy lịch.");
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

            throw new ResourceNotFoundException("Không tìm thấy phòng.");
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
        private async Task<string> GetRoomNameAsync(string roomId)
        {
            var roomType = await DetectRoomTypeAsync(roomId);
            return roomType switch
            {
                "EXAMINATION" => (await _context.ExaminationRooms.FirstOrDefaultAsync(r => r.Id == roomId))?.Name ?? "Unknown Room",
                "LABORATORY" => (await _context.LaboratoryRooms.FirstOrDefaultAsync(r => r.Id == roomId))?.Name ?? "Unknown Room",
                _ => "Unknown Room"
            };
        }
    }
    public enum ScheduleStatus
    {
        SCHEDULED,
        PRESENT,
        ABSENT
    }
}
