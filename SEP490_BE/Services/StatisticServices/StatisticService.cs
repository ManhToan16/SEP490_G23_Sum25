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

        public async Task<DashboardOverviewDTO> GetDashboardOverviewAsync()
        {
            var today = DateTime.Today;
            var thisMonth = new DateTime(today.Year, today.Month, 1);
            var lastMonth = thisMonth.AddMonths(-1);

            var patientStats = await GetPatientStatisticsAsync(thisMonth, today);
            var appointmentStats = await GetAppointmentStatisticsAsync(thisMonth, today);
            var revenueStats = await GetRevenueStatisticsAsync(thisMonth, today);
            var staffStats = await GetStaffStatisticsAsync();
            var inventoryStats = await GetInventoryStatisticsAsync();

            // Mock data for recent activities and alerts
            var recentActivities = new List<RecentActivityDTO>
            {
                new RecentActivityDTO
                {
                    Id = "1",
                    Type = "CREATE_USER",
                    User = "Admin",
                    Action = "Tạo tài khoản bác sĩ mới: BS. Nguyễn Văn X",
                    Time = DateTime.Now.AddMinutes(-10)
                },
                new RecentActivityDTO
                {
                    Id = "2",
                    Type = "UPDATE_SYSTEM",
                    User = "System",
                    Action = "Cập nhật cấu hình hệ thống",
                    Time = DateTime.Now.AddHours(-1)
                }
            };

            var systemAlerts = new List<SystemAlertDTO>
            {
                new SystemAlertDTO
                {
                    Id = "1",
                    Level = "warning",
                    Message = "Dung lượng ổ cứng sắp đầy (85%)",
                    Time = DateTime.Now.AddMinutes(-30)
                },
                new SystemAlertDTO
                {
                    Id = "2",
                    Level = "info",
                    Message = "Backup dữ liệu hoàn thành",
                    Time = DateTime.Now.AddHours(-2)
                }
            };

            return new DashboardOverviewDTO
            {
                PatientStats = patientStats,
                AppointmentStats = appointmentStats,
                RevenueStats = revenueStats,
                StaffStats = staffStats,
                InventoryStats = inventoryStats,
                RecentActivities = recentActivities,
                SystemAlerts = systemAlerts
            };
        }

        public async Task<RevenueStatisticsDTO> GetRevenueStatisticsAsync(DateTime? fromDate, DateTime? toDate)
        {
            if (!fromDate.HasValue) fromDate = DateTime.Today.AddDays(-30);
            if (!toDate.HasValue) toDate = DateTime.Today;

            // Mock revenue data - in real implementation, calculate from appointments, services, etc.
            var totalRevenue = 15000000m; // 15M VND
            var monthlyRevenue = 5000000m; // 5M VND
            var weeklyRevenue = 1200000m; // 1.2M VND
            var dailyRevenue = 200000m; // 200K VND

            var dailyRevenues = new List<DailyRevenueDTO>();
            for (var date = fromDate.Value; date <= toDate.Value; date = date.AddDays(1))
            {
                dailyRevenues.Add(new DailyRevenueDTO
                {
                    Date = date,
                    Revenue = new Random().Next(150000, 300000) // Random revenue between 150K-300K
                });
            }

            return new RevenueStatisticsDTO
            {
                TotalRevenue = totalRevenue,
                MonthlyRevenue = monthlyRevenue,
                WeeklyRevenue = weeklyRevenue,
                DailyRevenue = dailyRevenue,
                GrowthRate = 8.5,
                AverageRevenuePerPatient = 250000m,
                DailyRevenues = dailyRevenues
            };
        }

        public async Task<PatientStatisticsDTO> GetPatientStatisticsAsync(DateTime? fromDate, DateTime? toDate)
        {
            if (!fromDate.HasValue) fromDate = DateTime.Today.AddDays(-30);
            if (!toDate.HasValue) toDate = DateTime.Today;

            var totalPatients = await _context.PatientProfiles.CountAsync();
            var newPatients = await _context.PatientProfiles
                .Where(p => p.CreatedAt >= fromDate.Value && p.CreatedAt <= toDate.Value)
                .CountAsync();
            var activePatients = await _context.PatientProfiles
                .Where(p => p.CreatedAt >= DateTime.Today.AddDays(-90))
                .CountAsync();

            // Calculate growth rate
            var lastPeriodPatients = await _context.PatientProfiles
                .Where(p => p.CreatedAt >= fromDate.Value.AddDays(-30) && p.CreatedAt < fromDate.Value)
                .CountAsync();
            
            var growthRate = lastPeriodPatients > 0 
                ? ((double)(newPatients - lastPeriodPatients) / lastPeriodPatients) * 100 
                : 0;

            return new PatientStatisticsDTO
            {
                TotalPatients = totalPatients,
                NewPatients = newPatients,
                ActivePatients = activePatients,
                GrowthRate = Math.Round(growthRate, 2)
            };
        }

        public async Task<AppointmentStatisticsDTO> GetAppointmentStatisticsAsync(DateTime? fromDate, DateTime? toDate)
        {
            if (!fromDate.HasValue) fromDate = DateTime.Today.AddDays(-30);
            if (!toDate.HasValue) toDate = DateTime.Today;

            var appointments = await _context.Appointments
                .Where(a => a.Date >= fromDate.Value && a.Date <= toDate.Value)
                .ToListAsync();

            var totalAppointments = appointments.Count;
            var pendingAppointments = appointments.Count(a => a.Status == "WAITING_FOR_CONFIRMATION");
            var completedAppointments = appointments.Count(a => a.Status == "COMPLETED");
            var cancelledAppointments = appointments.Count(a => a.Status == "CANCELLED");

            var completionRate = totalAppointments > 0 
                ? ((double)completedAppointments / totalAppointments) * 100 
                : 0;

            var appointmentsByStatus = new List<AppointmentByStatusDTO>
            {
                new AppointmentByStatusDTO { Status = "Chờ xác nhận", Count = pendingAppointments, Percentage = totalAppointments > 0 ? (double)pendingAppointments / totalAppointments * 100 : 0 },
                new AppointmentByStatusDTO { Status = "Hoàn thành", Count = completedAppointments, Percentage = totalAppointments > 0 ? (double)completedAppointments / totalAppointments * 100 : 0 },
                new AppointmentByStatusDTO { Status = "Đã hủy", Count = cancelledAppointments, Percentage = totalAppointments > 0 ? (double)cancelledAppointments / totalAppointments * 100 : 0 }
            };

            return new AppointmentStatisticsDTO
            {
                TotalAppointments = totalAppointments,
                PendingAppointments = pendingAppointments,
                CompletedAppointments = completedAppointments,
                CancelledAppointments = cancelledAppointments,
                CompletionRate = Math.Round(completionRate, 2),
                AppointmentsByStatus = appointmentsByStatus
            };
        }

        public async Task<StaffStatisticsDTO> GetStaffStatisticsAsync()
        {
            var doctors = await _context.Users
                .Include(u => u.UserRoles)
                .Where(u => u.UserRoles.Any(ur => ur.RoleName == "DOCTOR"))
                .CountAsync();

            var nurses = await _context.Users
                .Include(u => u.UserRoles)
                .Where(u => u.UserRoles.Any(ur => ur.RoleName == "NURSE"))
                .CountAsync();

            var technicians = await _context.Users
                .Include(u => u.UserRoles)
                .Where(u => u.UserRoles.Any(ur => ur.RoleName == "TECHNICIAN"))
                .CountAsync();

            var receptionists = await _context.Users
                .Include(u => u.UserRoles)
                .Where(u => u.UserRoles.Any(ur => ur.RoleName == "RECEPTIONIST"))
                .CountAsync();

            var totalStaff = doctors + nurses + technicians + receptionists;

            var staffByRole = new List<StaffByRoleDTO>
            {
                new StaffByRoleDTO { Role = "Bác sĩ", Count = doctors, Percentage = totalStaff > 0 ? (double)doctors / totalStaff * 100 : 0 },
                new StaffByRoleDTO { Role = "Y tá", Count = nurses, Percentage = totalStaff > 0 ? (double)nurses / totalStaff * 100 : 0 },
                new StaffByRoleDTO { Role = "Kỹ thuật viên", Count = technicians, Percentage = totalStaff > 0 ? (double)technicians / totalStaff * 100 : 0 },
                new StaffByRoleDTO { Role = "Lễ tân", Count = receptionists, Percentage = totalStaff > 0 ? (double)receptionists / totalStaff * 100 : 0 }
            };

            // Mock attendance rate
            var doctorAttendanceRate = 95.5;

            return new StaffStatisticsDTO
            {
                TotalDoctors = doctors,
                TotalNurses = nurses,
                TotalTechnicians = technicians,
                TotalReceptionists = receptionists,
                DoctorAttendanceRate = doctorAttendanceRate,
                StaffByRole = staffByRole
            };
        }

        public async Task<RoomUtilizationDTO> GetRoomUtilizationAsync(DateTime? date)
        {
            if (!date.HasValue) date = DateTime.Today;

            var totalExaminationRooms = await _context.ExaminationRooms.CountAsync();
            var totalLaboratoryRooms = await _context.LaboratoryRooms.CountAsync();
            var totalRooms = totalExaminationRooms + totalLaboratoryRooms;

            // Mock data for room utilization
            var availableRooms = totalRooms - 2; // 2 rooms occupied
            var occupiedRooms = 2;
            var utilizationRate = totalRooms > 0 ? ((double)occupiedRooms / totalRooms) * 100 : 0;

            var roomStatuses = new List<RoomStatusDTO>
            {
                new RoomStatusDTO { RoomId = "1", RoomName = "Phòng Khám A", RoomType = "EXAMINATION", Status = "occupied", CurrentUser = "BS. Nguyễn Văn A" },
                new RoomStatusDTO { RoomId = "2", RoomName = "Phòng Khám B", RoomType = "EXAMINATION", Status = "available", CurrentUser = "" },
                new RoomStatusDTO { RoomId = "3", RoomName = "Phòng Xét nghiệm 1", RoomType = "LABORATORY", Status = "occupied", CurrentUser = "KTV. Trần Thị B" }
            };

            return new RoomUtilizationDTO
            {
                TotalExaminationRooms = totalExaminationRooms,
                TotalLaboratoryRooms = totalLaboratoryRooms,
                AvailableRooms = availableRooms,
                OccupiedRooms = occupiedRooms,
                UtilizationRate = Math.Round(utilizationRate, 2),
                RoomStatuses = roomStatuses
            };
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
