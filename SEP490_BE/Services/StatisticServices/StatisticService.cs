using Microsoft.EntityFrameworkCore;
using SEP490_BE.DTO.StatisticsDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using System;

namespace SEP490_BE.Services.StatisticServices
{
    public class StatisticService : IStatisticService
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public StatisticService(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        //public async Task<PatientStatisticsDTO> GetPatientStatisticsAsync(DateTime? fromDate, DateTime? toDate)
        //{
        //    var query = _context.Visits.AsQueryable();
        //    if (fromDate.HasValue) query = query.Where(p => p.CreatedDate >= fromDate.Value);
        //    if (toDate.HasValue) query = query.Where(p => p.CreatedDate <= toDate.Value);

        //    return new PatientStatisticsDTO
        //    {
        //        TotalPatients = await query.CountAsync(),
        //        NewPatients = await query.Where(p => p.CreatedDate >= DateTime.UtcNow.AddMonths(-1)).CountAsync()
        //    };
        //}

        public async Task<List<WorkScheduleStatDTO>> GetScheduleStatisticsAsync(DateTime? fromDate, DateTime? toDate)
        {
            if (fromDate > toDate)
            {
                throw new Exceptions.ArgumentException("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
            }
            var schedules = await _context.Schedules
                .Include(s => s.User).Include(x=>x.TimeSlot)
                .Where(s => s.Date >= fromDate && s.Date <= toDate)
                .ToListAsync();

            var result = new List<WorkScheduleStatDTO>();

            foreach (var s in schedules)
            {
                result.Add(new WorkScheduleStatDTO
                {
                    Date = s.Date,
                    TimeSlot = s.TimeSlot.Name, // Hoặc mapping int -> text
                    DoctorName = s.User.Name,
                    Status = s.Status,
                    RoomType = await DetectRoomTypeAsync(s.RoomId),
                    RoomName = await GetRoomNameAsync(s.RoomId)
                });
            }

            return result;
        }
        private async Task<string> DetectRoomTypeAsync(string roomId)
        {
            if (await _context.ExaminationRooms.AnyAsync(r => r.Id == roomId))
                return "EXAMINATION";

            if (await _context.LaboratoryRooms.AnyAsync(r => r.Id == roomId))
                return "LABORATORY";

            throw new ResourceNotFoundException("Không tìm thấy phòng.");
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
        //public async Task<ServiceStatisticsDTO> GetServiceStatisticsAsync(DateTime? fromDate, DateTime? toDate)
        //{
        //    var query = _context.Services.AsQueryable();
        //    if (fromDate.HasValue) query = query.Where(s => s.CreatedDate >= fromDate.Value);
        //    if (toDate.HasValue) query = query.Where(s => s.CreatedDate <= toDate.Value);

        //    return new ServiceStatisticsDTO
        //    {
        //        TotalServices = await query.CountAsync(),
        //        CompletedServices = await _context.ExaminationRooms.CountAsync(e => e. == "COMPLETED"),
        //        PendingResults = await _context.Examinations.CountAsync(e => e.Status == "PENDING")
        //    };
        //}

        public async Task<InventoryStatisticsDTO> GetInventoryStatisticsAsync()
        {
            return new InventoryStatisticsDTO
            {
                TotalMaterials = await _context.Materials.CountAsync(),
                LowStockMaterials = await _context.Materials.CountAsync(m => m.QuantityInStock < m.MinQuantity),
                TotalMedicines = await _context.Medicines.CountAsync(),
            
            };
        }
        public async Task<List<DoctorAttendanceStatDTO>> GetDoctorAttendanceStatisticsAsync(DateTime? fromDate, DateTime? toDate)
        {
            if (!fromDate.HasValue || !toDate.HasValue)
            {
                var today = DateTime.Today;

                // Lấy thứ 2 của tuần hiện tại
                int diffToMonday = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
                fromDate = today.AddDays(-diffToMonday);

                // Lấy Chủ nhật của tuần hiện tại
                toDate = fromDate.Value.AddDays(6);
            }
            if (fromDate > toDate)
            {
                throw new Exceptions.ArgumentException("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
            }
            var schedules = await _context.Schedules
                .Include(s => s.User)
                .Where(s => s.Date >= fromDate && s.Date <= toDate)
                .ToListAsync();

            var stats = schedules
                .GroupBy(s => new { s.UserId, Month = s.Date.Month, Year = s.Date.Year })
                .Select(g =>
                {
                    var totalSessions = g.Count();
                    var absentCount = g.Count(x => x.Status == "ABSENT");
                    var presentCount = g.Count(x => x.Status == "PRESENT");

                    // Tính % attendance
                    double attendanceRate;
                    if (absentCount <= 2)
                    {
                        attendanceRate = 100.0; // Cho phép vắng ≤ 2 buổi vẫn xem như đủ
                    }
                    else
                    {
                        attendanceRate = ((double)(totalSessions - absentCount) / totalSessions) * 100;
                    }

                    return new DoctorAttendanceStatDTO
                    {
                        DoctorId = g.Key.UserId,
                        DoctorName = g.First().User.Name,
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        TotalSessions = totalSessions,
                        AbsentCount = absentCount,
                        PresentCount = presentCount,
                        AttendanceRate = Math.Round(attendanceRate, 2)
                    };
                })
                .ToList();

            return stats;
        }

    }
}
