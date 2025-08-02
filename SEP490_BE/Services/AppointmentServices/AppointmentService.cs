using SEP490_BE.DTO.AppointmentDTO;
using SEP490_BE.DTO.UserDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.RoleRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Services.AuthServices;
using StackExchange.Redis;
using SEP490_BE.Repositories.AppointmentRepositories;
using SEP490_BE.Constants;
using SEP490_BE.Exceptions;
using Microsoft.EntityFrameworkCore;
using SEP490_BE.Services.EmailServices;
using SEP490_BE.Repositories.VisitRepositories;
using SEP490_BE.Services.AssignmentServices;
using SEP490_BE.Services.VisitServices;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using SEP490_BE.Controllers;
using QuestPDF.Infrastructure;
using Microsoft.AspNetCore.SignalR;
using SEP490_BE.Hubs;
using SEP490_BE.Repositories.TimeSlotRepositories;

namespace SEP490_BE.Services.AppointmentServices
{
    public class AppointmentService : IAppointmentService
    {

        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IAuthService _authService;
        private readonly IAuditLogRepository _logRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly IVisitRepository _visitRepository;
        private readonly IVisitService _visitService;
        private readonly IAssignmentService _assignmentService; 
        private readonly ILogger<AppointmentService> _logger;
        private readonly IHubContext<KhanhAnHub> _hubContext;
        private readonly ITimeSlotRepository _timeSlotRepository;

        public AppointmentService(
            KhanhAnNeurologyClinicContext context,
            IAuthService authService,
            IAuditLogRepository logRepository,
            IAppointmentRepository appointmentRepository,
            IUserRepository userRepository,
            IEmailService emailService,
            IVisitRepository visitRepository,
            IVisitService visitService,
            IAssignmentService assignmentService,
            ILogger<AppointmentService> logger,
            IHubContext<KhanhAnHub> hubContext,
            ITimeSlotRepository timeSlotRepository
            )
        {
            _context = context;
            _authService = authService;
            _logRepository = logRepository;
            _appointmentRepository = appointmentRepository;
            _userRepository = userRepository;
            _emailService = emailService;
            _visitRepository = visitRepository;
            _visitService = visitService;
            _assignmentService = assignmentService;
            _logger = logger;
            _hubContext = hubContext;
            _timeSlotRepository = timeSlotRepository;
        }

        public async Task<Pagination<AppointmentResponseDTO>> GetAll(
            string? name,
            string? email,
            string? phoneNumber,
            DateTime? dob,
            DateTime? date,
            string? status,
            int pageNumber,
            int pageSize)
        {
            var (appointments, totalItems) = await _appointmentRepository.FindAll(name, email, phoneNumber, dob, date, status, pageNumber, pageSize);
            return new Pagination<AppointmentResponseDTO>
            {
                Items = appointments,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<AppointmentResponseDTO> GetById(string id)
        {
            var appointment = await _appointmentRepository.FindById(id);
            if (appointment == null)
            {
                throw new ResourceNotFoundException(MessageConstants.APPOINTMENT_NOT_FOUND);
            }
            return new AppointmentResponseDTO
            {
                Id = appointment.Id,
                Name = appointment.Name,
                PhoneNumber = appointment.PhoneNumber,
                Email = appointment.Email,
                DateOfBirth = appointment.DateOfBirth,
                Gender = appointment.Gender,
                Address = appointment.Address,
                Symptom = appointment.Symptom,
                RequiredDoctorId = appointment.RequiredDoctorId,
                Date = appointment.Date,
                TimeSlotId = appointment.TimeSlotId,
                Status = appointment.Status,
                TotalPrice = appointment.TotalPrice,
                ExpiredAt = appointment.ExpiredAt,
                CreatedAt = appointment.CreatedAt
            };
        }

        public async Task<AppointmentResponseDTO> Create(AppointmentRequestDTO request)
        {
            string newAppointmentId = Guid.NewGuid().ToString();

            var requiredDoctor = new User();
            if (!string.IsNullOrWhiteSpace(request.RequiredDoctorId))
            {
                requiredDoctor = await _userRepository.FindById(request.RequiredDoctorId);
                if (requiredDoctor == null)
                {
                throw new ResourceNotFoundException(MessageConstants.DOCTOR_NOT_FOUND);
                }
            }

            var timeSlot = await _context.TimeSlots.FirstOrDefaultAsync(ts => ts.Id == request.TimeSlotId);
            if (timeSlot == null)
            {
                throw new ResourceNotFoundException(MessageConstants.TIMESLOT_NOT_FOUND);
            }

            var appointment = new Appointment
            {
                Id = newAppointmentId,
                Name = request.Name,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                Address = request.Address,
                Symptom = request.Symptom,
                RequiredDoctorId = requiredDoctor.Id,
                Date = request.Date,
                TimeSlotId = request.TimeSlotId,
                Status = AppointmentStatus.WAITING_FOR_CONFIRMATION,
                CreatedAt = DateTime.UtcNow,
                ExpiredAt = request.Date.Date.AddDays(1).AddMilliseconds(-1)
            };
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _appointmentRepository.Insert(appointment);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _hubContext.Clients.All.SendAsync("AppointmentChanged", new
                {
                    Action = "CREATE",
                    Id = appointment.Id,
                    Email = appointment.Email,
                    PhoneNumber = appointment.PhoneNumber,
                    DateOfBirth = appointment.DateOfBirth,
                    Date = appointment.Date,
                    Status = appointment.Status,
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            var htmlContent = $@"
                <h2>Gửi yêu cầu đặt lịch khám thành công</h2>
                <p>Xin chào <strong>{appointment.Name}</strong>,</p>
                <p>Bạn đã yêu cầu đặt lịch khám tại <strong>Khanh An Neurology Clinic</strong>.</p>
                <p><strong>Ngày khám:</strong> {appointment.Date:dd/MM/yyyy}</p>
                <p><strong>Khung giờ:</strong> {timeSlot.StartTime} - {timeSlot.EndTime}</p>
                <p><strong>Triệu chứng:</strong> {appointment.Symptom}</p>
                <p><strong>Bác sĩ mong muốn:</strong> {requiredDoctor?.Name ?? "Không"}</p>
                <br/>
                <p>Thông báo sẽ được gửi cho bạn qua email này sau khi lịch hẹn được chúng tôi xác nhận.</p>
                <p>Trân trọng,<br/>Khanh An Neurology Clinic</p>";
            await _emailService.SendAsync(
                appointment.Email,
                "Lịch hẹn khám tại Khanh An Neurology Clinic",
                htmlContent);
            return new AppointmentResponseDTO
            {
                Id = appointment.Id,
                Name = appointment.Name,
                PhoneNumber = appointment.PhoneNumber,
                Email = appointment.Email,
                DateOfBirth = appointment.DateOfBirth,
                Gender = appointment.Gender,
                Address = appointment.Address,
                Symptom = appointment.Symptom,
                RequiredDoctorId = requiredDoctor.Id ?? "",
                RequiredDoctorName = requiredDoctor?.Name ?? "",
                Date = appointment.Date,
                TimeSlotId = appointment.TimeSlotId,
                TimeSlotStartTime = appointment.TimeSlot.StartTime,
                TimeSlotEndTime = appointment.TimeSlot.EndTime,
                Status = appointment.Status,
                TotalPrice = appointment.TotalPrice,
                ExpiredAt = appointment.ExpiredAt,
                CreatedAt = appointment.CreatedAt
            }; 
        }

        public async Task<AppointmentResponseDTO> CreatedByClinic(AppointmentRequestDTO request)
        {
            string newAppointmentId = Guid.NewGuid().ToString();
            var requiredDoctor = new User();
            if (!string.IsNullOrWhiteSpace(request.RequiredDoctorId))
            {
                requiredDoctor = await _userRepository.FindById(request.RequiredDoctorId);
                if (requiredDoctor == null)
                {
                    throw new ResourceNotFoundException(MessageConstants.DOCTOR_NOT_FOUND);
                }
            }
            var timeSlot = await _context.TimeSlots.FirstOrDefaultAsync(ts => ts.Id == request.TimeSlotId);
            if (timeSlot == null)
            {
                throw new ResourceNotFoundException(MessageConstants.TIMESLOT_NOT_FOUND);
            }
            var appointment = new Appointment
            {
                Id = newAppointmentId,
                Name = request.Name,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                Address = request.Address,
                Symptom = request.Symptom,
                RequiredDoctorId = requiredDoctor.Id,
                Date = request.Date,
                TimeSlotId = request.TimeSlotId,
                Status = AppointmentStatus.CHECKED_IN,
                CreatedAt = DateTime.UtcNow,
                ExpiredAt = request.Date.Date.AddDays(1).AddMilliseconds(-1)
            };
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _appointmentRepository.Insert(appointment);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _hubContext.Clients.All.SendAsync("AppointmentChanged", new
                {
                    Action = "CREATE",
                    Id = appointment.Id,
                    Email = appointment.Email,
                    PhoneNumber = appointment.PhoneNumber,
                    DateOfBirth = appointment.DateOfBirth,
                    Date = appointment.Date,
                    Status = appointment.Status,
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            var htmlContent = $@"
                    <h2>Đặt lịch khám thành công</h2>
                    <p>Xin chào <strong>{appointment.Name}</strong>,</p>
                    <p>Bạn đã được chúng tôi đặt lịch khám tại <strong>Khanh An Neurology Clinic</strong>.</p>
                    <p><strong>Ngày khám:</strong> {appointment.Date:dd/MM/yyyy}</p>
                    <p><strong>Khung giờ:</strong> {timeSlot.StartTime} - {timeSlot.EndTime}</p>
                    <p><strong>Triệu chứng:</strong> {appointment.Symptom}</p>
                    <p><strong>Bác sĩ mong muốn:</strong> {requiredDoctor.Name}</p>
                    <br/>
                    <p>Trân trọng,<br/>Khanh An Neurology Clinic</p>";

            await _emailService.SendAsync(
                appointment.Email,
                "Lịch hẹn khám tại Khanh An Neurology Clinic",
                htmlContent);
            return new AppointmentResponseDTO
            {
                Id = appointment.Id,
                Name = appointment.Name,
                PhoneNumber = appointment.PhoneNumber,
                Email = appointment.Email,
                DateOfBirth = appointment.DateOfBirth,
                Gender = appointment.Gender,
                Address = appointment.Address,
                Symptom = appointment.Symptom,
                RequiredDoctorId = requiredDoctor.Id ?? "",
                RequiredDoctorName = requiredDoctor.Name ?? "",
                Date = appointment.Date,
                TimeSlotId = appointment.TimeSlotId,
                TimeSlotStartTime = appointment.TimeSlot.StartTime,
                TimeSlotEndTime = appointment.TimeSlot.EndTime,
                Status = appointment.Status,
                TotalPrice = appointment.TotalPrice,
                ExpiredAt = appointment.ExpiredAt,
                CreatedAt = appointment.CreatedAt
            };
        }

        public async Task<AppointmentResponseDTO> Update(string id, AppointmentRequestDTO request)
        {
            var appointment = await _appointmentRepository.FindById(id);
            if (appointment == null)
            {
                throw new ResourceNotFoundException(MessageConstants.APPOINTMENT_NOT_FOUND);
            }
            var requiredDoctor = new User();
            if (!string.IsNullOrWhiteSpace(request.RequiredDoctorId))
            {
                requiredDoctor = await _userRepository.FindById(request.RequiredDoctorId);
                if (requiredDoctor == null)
                {
                    throw new ResourceNotFoundException(MessageConstants.DOCTOR_NOT_FOUND);
                }
            }
            var timeSlot = await _context.TimeSlots.FirstOrDefaultAsync(ts => ts.Id == request.TimeSlotId);
            if (timeSlot == null)
            {
                throw new ResourceNotFoundException(MessageConstants.TIMESLOT_NOT_FOUND);
            }
            if (appointment.Status != AppointmentStatus.WAITING_FOR_CONFIRMATION && appointment.Status != AppointmentStatus.WAITING_FOR_CHECK_IN)
            {
                throw new Exceptions.ArgumentException(MessageConstants.APPOINTMENT_INVALID_UPDATE);
            }
            appointment.Name = request.Name;
            appointment.PhoneNumber = request.PhoneNumber;
            appointment.Email = request.Email;
            appointment.DateOfBirth = request.DateOfBirth;
            appointment.Gender = request.Gender;
            appointment.Address = request.Address;
            appointment.Symptom = request.Symptom;
            appointment.RequiredDoctorId = requiredDoctor.Id;
            appointment.Date = request.Date;
            appointment.TimeSlotId = request.TimeSlotId;
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _appointmentRepository.Update(appointment);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _hubContext.Clients.All.SendAsync("AppointmentChanged", new
                {
                    Action = "UPDATE",
                    Id = appointment.Id,
                    Email = appointment.Email,
                    PhoneNumber = appointment.PhoneNumber,
                    DateOfBirth = appointment.DateOfBirth,
                    Date = appointment.Date,
                    Status = appointment.Status,
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new AppointmentResponseDTO
            {
                Id = appointment.Id,
                Name = appointment.Name,
                PhoneNumber = appointment.PhoneNumber,
                Email = appointment.Email,
                DateOfBirth = appointment.DateOfBirth,
                Gender = appointment.Gender,
                Address = appointment.Address,
                Symptom = appointment.Symptom,
                RequiredDoctorId = requiredDoctor.Id ?? "",
                RequiredDoctorName = requiredDoctor.Name ?? "",
                Date = appointment.Date,
                TimeSlotId = appointment.TimeSlotId,
                TimeSlotStartTime = appointment.TimeSlot.StartTime,
                TimeSlotEndTime = appointment.TimeSlot.EndTime,
                Status = appointment.Status,
                TotalPrice = appointment.TotalPrice,
                ExpiredAt = appointment.ExpiredAt,
                CreatedAt = appointment.CreatedAt
            };
        }

        public async Task<AppointmentResponseDTO> CheckIn(string id)
        {
            var appointment = await _appointmentRepository.FindById(id);
            if (appointment == null)
            {
                throw new ResourceNotFoundException(MessageConstants.APPOINTMENT_NOT_FOUND);
            }

            if (appointment.Status != AppointmentStatus.WAITING_FOR_CHECK_IN)
                {
                    throw new Exceptions.ArgumentException(MessageConstants.APPOINTMENT_INVALID_UPDATE);
                }

            appointment.Status = AppointmentStatus.CHECKED_IN;
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _appointmentRepository.Update(appointment);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _hubContext.Clients.All.SendAsync("AppointmentChanged", new
                {
                    Action = "UPDATE",
                    Id = appointment.Id,
                    Email = appointment.Email,
                    PhoneNumber = appointment.PhoneNumber,
                    DateOfBirth = appointment.DateOfBirth,
                    Date = appointment.Date,
                    Status = appointment.Status,
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return new AppointmentResponseDTO
            {
                Id = appointment.Id,
                Name = appointment.Name,
                PhoneNumber = appointment.PhoneNumber,
                Email = appointment.Email,
                DateOfBirth = appointment.DateOfBirth,
                Gender = appointment.Gender,
                Address = appointment.Address ?? "",
                Symptom = appointment.Symptom ?? "",
                RequiredDoctorId = appointment.RequiredDoctorId ?? "",
                RequiredDoctorName = appointment.RequiredDoctor?.Name ?? "",
                Date = appointment.Date,
                TimeSlotId = appointment.TimeSlotId,
                TimeSlotStartTime = appointment.TimeSlot.StartTime,
                TimeSlotEndTime = appointment.TimeSlot.EndTime,
                Status = appointment.Status,
                TotalPrice = appointment.TotalPrice,
                ExpiredAt = appointment.ExpiredAt,
                CreatedAt = appointment.CreatedAt
            };
        }

        public async Task<AppointmentResponseDTO> Confirm(string id)
        {
            var appointment = await _appointmentRepository.FindById(id);
            if (appointment == null)
            {
                throw new ResourceNotFoundException(MessageConstants.APPOINTMENT_NOT_FOUND);
            }
            if (appointment.Status != AppointmentStatus.WAITING_FOR_CONFIRMATION) {
                throw new Exceptions.ArgumentException(MessageConstants.APPOINTMENT_INVALID_UPDATE);
            }
            appointment.Status = AppointmentStatus.WAITING_FOR_CHECK_IN;            
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _appointmentRepository.Update(appointment);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _hubContext.Clients.All.SendAsync("AppointmentChanged", new
                {
                    Action = "UPDATE",
                    Id = appointment.Id,
                    Email = appointment.Email,
                    PhoneNumber = appointment.PhoneNumber,
                    DateOfBirth = appointment.DateOfBirth,
                    Date = appointment.Date,
                    Status = appointment.Status,
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            var htmlContent = $@"
                    <h2>Đặt lịch khám thành công</h2>
                    <p>Xin chào <strong>{appointment.Name}</strong>,</p>
                    <p>Bạn đã yêu cầu đặt lịch khám tại <strong>Khanh An Neurology Clinic</strong>.</p>
                    <p><strong>Ngày khám:</strong> {appointment.Date:dd/MM/yyyy}</p>
                    <p><strong>Khung giờ:</strong> {appointment.TimeSlot.StartTime} - {appointment.TimeSlot.EndTime}</p>
                    <p><strong>Triệu chứng:</strong> {appointment.Symptom}</p>
                    <p><strong>Bác sĩ mong muốn:</strong> {appointment.RequiredDoctor?.Name ?? "Không"}</p>
                    <br/>
                    <p>Lịch hẹn khám của bạn đã được chúng tôi xác nhận, vui lòng đến đúng giờ và mang theo giấy tờ cần thiết.</p>
                    <p>Trân trọng,<br/>Khanh An Neurology Clinic</p>";
            await _emailService.SendAsync(
                appointment.Email,
                "Lịch hẹn khám tại Khanh An Neurology Clinic",
                htmlContent);
            return new AppointmentResponseDTO
            {
                Id = appointment.Id,
                Name = appointment.Name,
                PhoneNumber = appointment.PhoneNumber,
                Email = appointment.Email,
                DateOfBirth = appointment.DateOfBirth,
                Gender = appointment.Gender,
                Address = appointment.Address ?? "",
                Symptom = appointment.Symptom ?? "",
                RequiredDoctorId = appointment.RequiredDoctorId ?? "",
                RequiredDoctorName = appointment.RequiredDoctor?.Name ?? "",
                Date = appointment.Date,
                TimeSlotId = appointment.TimeSlotId,
                TimeSlotStartTime = appointment.TimeSlot.StartTime,
                TimeSlotEndTime = appointment.TimeSlot.EndTime,
                Status = appointment.Status,
                TotalPrice = appointment.TotalPrice,
                ExpiredAt = appointment.ExpiredAt,
                CreatedAt = appointment.CreatedAt
            };
        }

        public async Task<AppointmentResponseDTO> Cancel(string id)
        {
            var appointment = await _appointmentRepository.FindById(id);
            if (appointment == null)
            {
                throw new ResourceNotFoundException(MessageConstants.APPOINTMENT_NOT_FOUND);
            }
            if (appointment.Status == AppointmentStatus.COMPLETED)
            {
                throw new Exceptions.ArgumentException(MessageConstants.APPOINTMENT_INVALID_UPDATE);
            }
            appointment.Status = AppointmentStatus.CANCELLED;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _appointmentRepository.Update(appointment);

                var visit = await _context.Visits.FirstOrDefaultAsync(v => v.AppointmentId == appointment.Id);
                var assignments = new List<Assignment>();
                if (visit != null)
                {
                    visit.Status = VisitStatus.CANCELLED;
                    await _visitRepository.Update(visit);

                    assignments = await _context.Assignments
                        .Where(a => a.VisitId == visit.Id)
                        .ToListAsync();
                    foreach (var asm in assignments)
                    {
                        asm.Status = AssignmentStatus.CANCELLED;
                    }
                    _context.Assignments.UpdateRange(assignments);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _hubContext.Clients.All.SendAsync("AppointmentChanged", new
                {
                    Action = "UPDATE",
                    Id = appointment.Id,
                    Email = appointment.Email,
                    PhoneNumber = appointment.PhoneNumber,
                    DateOfBirth = appointment.DateOfBirth,
                    Date = appointment.Date,
                    Status = appointment.Status,
                });

                if (visit != null)
                {
                    await _hubContext.Clients.All.SendAsync("VisitChanged", new
                    {
                        Action = "UPDATE",
                        VisitId = visit.Id,
                        ExaminationRoomId = visit.ExaminationRoomId,
                        QueueNumber = visit.QueueNumber,
                        Status = visit.Status,
                        IsPrioritized = visit.IsPrioritized,
                    });
                }

                if (assignments != null)
                {
                    foreach (var asm in assignments)
                    {
                        await _hubContext.Clients.All.SendAsync("AssignmentChanged", new
                        {
                            Action = "UPDATE",
                            AssignmentId = asm.Id,
                            LaboratoryRoomId = asm.LaboratoryRoomId,
                            Status = asm.Status
                        });
                    }
                }
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            var htmlContent = $@"
                    <h2>Lịch hẹn của bạn đã bị huỷ.</h2>
                    <p>Xin chào <strong>{appointment.Name}</strong>,</p>
                    <p>Bạn đã yêu cầu đặt lịch khám tại <strong>Khanh An Neurology Clinic</strong>.</p>
                    <p><strong>Ngày khám:</strong> {appointment.Date:dd/MM/yyyy}</p>
                    <p><strong>Khung giờ:</strong> {appointment.TimeSlot.StartTime} - {appointment.TimeSlot.EndTime}</p>
                    <p><strong>Triệu chứng:</strong> {appointment.Symptom}</p>
                    <p><strong>Bác sĩ mong muốn:</strong> {appointment.RequiredDoctor?.Name ?? "Không"}</p>
                    <br/>
                    <p>Lịch hẹn khám của bạn đã bị huỷ.</p>
                    <p>Trân trọng,<br/>Khanh An Neurology Clinic</p>";
            await _emailService.SendAsync(
                appointment.Email,
                "Lịch hẹn khám tại Khanh An Neurology Clinic",
                htmlContent);
            return new AppointmentResponseDTO
            {
                Id = appointment.Id,
                Name = appointment.Name,
                PhoneNumber = appointment.PhoneNumber,
                Email = appointment.Email,
                DateOfBirth = appointment.DateOfBirth,
                Gender = appointment.Gender,
                Address = appointment.Address ?? "",
                Symptom = appointment.Symptom ?? "",
                RequiredDoctorId = appointment.RequiredDoctorId ?? "",
                RequiredDoctorName = appointment.RequiredDoctor?.Name ?? "",
                Date = appointment.Date,
                TimeSlotId = appointment.TimeSlotId,
                TimeSlotStartTime = appointment.TimeSlot.StartTime,
                TimeSlotEndTime = appointment.TimeSlot.EndTime,
                Status = appointment.Status,
                TotalPrice = appointment.TotalPrice,
                ExpiredAt = appointment.ExpiredAt,
                CreatedAt = appointment.CreatedAt
            };
        }
        
        public async Task<AppointmentResponseDTO> MarkAsPaid(string id)
        {
            var appointment = await _appointmentRepository.FindById(id);
            if (appointment == null)
            {
                throw new ResourceNotFoundException(MessageConstants.APPOINTMENT_NOT_FOUND);
            }

            if (appointment.Status != AppointmentStatus.PENDING)
            {
                throw new Exceptions.ArgumentException(MessageConstants.APPOINTMENT_INVALID_UPDATE);
            }

            var visit = await _context.Visits
                .FirstOrDefaultAsync(v => v.AppointmentId == appointment.Id);

            if (visit == null)
            {
                throw new ResourceNotFoundException("Visit not found.");
            }

            var assignments = await _context.Assignments
                .Where(a => a.VisitId == visit.Id)
                .ToListAsync();

            appointment.Status = AppointmentStatus.IN_LABORATORY_PROGRESS;
            visit.Status = VisitStatus.IN_LABORATORY;

            foreach (var assignment in assignments)
            {
                if (assignment.Status == AssignmentStatus.PENDING)
                {
                    assignment.Status = AssignmentStatus.WAITING;
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _appointmentRepository.Update(appointment);
                await _visitRepository.Update(visit);
                _context.Assignments.UpdateRange(assignments);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _hubContext.Clients.All.SendAsync("AppointmentChanged", new
                {
                    Action = "UPDATE",
                    Id = appointment.Id,
                    Email = appointment.Email,
                    PhoneNumber = appointment.PhoneNumber,
                    DateOfBirth = appointment.DateOfBirth,
                    Date = appointment.Date,
                    Status = appointment.Status,
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return new AppointmentResponseDTO
            {
                Id = appointment.Id,
                Name = appointment.Name,
                PhoneNumber = appointment.PhoneNumber,
                Email = appointment.Email,
                DateOfBirth = appointment.DateOfBirth,
                Gender = appointment.Gender,
                Address = appointment.Address ?? "",
                Symptom = appointment.Symptom ?? "",
                RequiredDoctorId = appointment.RequiredDoctorId ?? "",
                RequiredDoctorName = appointment.RequiredDoctor?.Name ?? "",
                Date = appointment.Date,
                TimeSlotId = appointment.TimeSlotId,
                TimeSlotStartTime = appointment.TimeSlot.StartTime,
                TimeSlotEndTime = appointment.TimeSlot.EndTime,
                Status = appointment.Status,
                TotalPrice = appointment.TotalPrice,
                ExpiredAt = appointment.ExpiredAt,
                CreatedAt = appointment.CreatedAt
            };
        }

        public async Task AutoExpired()
        {
            var today = DateTime.Today;

            var appointments = await _context.Appointments
                .Where(a =>
                    a.Date.Date == today &&
                    (a.Status == AppointmentStatus.WAITING_FOR_CHECK_IN ||
                     a.Status == AppointmentStatus.WAITING_FOR_CONFIRMATION))
                .ToListAsync();

            foreach (var appointment in appointments)
            {
                appointment.Status = AppointmentStatus.CANCELLED;
                await _appointmentRepository.Update(appointment);
            }
            await _context.SaveChangesAsync();
        }

        public async Task<byte[]> GenerateInvoicePdf(string appointmentId)
        {
            var appointment = await GetById(appointmentId);
            if (appointment.Status != AppointmentStatus.PENDING)
            {
                throw new Exceptions.ArgumentException("Lỗi khi in hoá đơn.");
            }
            var visit = await _visitService.GetByAppointmentId(appointmentId);
            var assignments = await _assignmentService.GetByVisitId(visit.VisitId);

            IContainer CellStyle(IContainer container) =>
                    container.BorderBottom(0.5f)
                                .BorderColor(Colors.Grey.Lighten2)
                                .PaddingVertical(5);

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Size(PageSizes.A4);

                    // ======= HEADER =======
                    page.Header().Column(headerCol =>
                    {
                        headerCol.Item().AlignCenter().Text("PHÒNG KHÁM NỘI THẦN KINH KHÁNH AN")
                            .FontSize(12).Bold().FontColor(Colors.Black);

                        headerCol.Item().PaddingBottom(10);

                        headerCol.Item().AlignCenter().Text("HÓA ĐƠN KHÁM BỆNH")
                            .FontSize(16).Bold().FontColor(Colors.Black);

                        headerCol.Item().PaddingBottom(30);
                    });

                    // ======= CONTENT =======
                    page.Content().Column(col =>
                    {
                        col.Spacing(5);

                        // ==== Thông tin lịch hẹn ====
                        col.Item().Text($"Ngày khám: {appointment.Date:dd/MM/yyyy}");
                        col.Item().Text($"Bệnh nhân: {appointment.Name} ({appointment.Gender}, {appointment.DateOfBirth:dd/MM/yyyy})");
                        col.Item().Text($"Email: {appointment.Email}   SĐT: {appointment.PhoneNumber}");
                        col.Item().Text($"Triệu chứng: {appointment.Symptom}");

                        // ==== Thông tin khám ====
                        col.Item().PaddingVertical(10).Text("Thông tin khám").FontSize(14).Bold();
                        col.Item().Text($"Phòng khám: {visit.ExaminationRoomName ?? "Không rõ"}");
                        col.Item().Text($"Bác sĩ khám: {visit.AssignedDoctorName ?? "Không rõ"}");
                        col.Item().Text($"Số thứ tự: {visit.QueueNumber} {(visit.IsPrioritized ? "(Ưu tiên)" : "")}");
                        col.Item().Text($"Giá tiền: {(visit.TotalPrice):#,##0} đ");


                        // ==== Danh sách dịch vụ ====
                        col.Item().PaddingVertical(10).Text("Danh sách dịch vụ").FontSize(14).Bold();

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn();      // Dịch vụ
                                columns.RelativeColumn();      // Phòng
                                columns.ConstantColumn(100);   // Giá
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("Dịch vụ").Bold();
                                header.Cell().Element(CellStyle).Text("Phòng").Bold();
                                header.Cell().Element(CellStyle).Text("Giá").Bold();
                            });

                            if (assignments != null && assignments.Any())
                            {
                                foreach (var a in assignments)
                                {
                                    var labRoom = a.LaboratoryRoomName ?? "Không rõ";

                                    if (a.AssignmentServices != null && a.AssignmentServices.Any())
                                    {
                                        foreach (var s in a.AssignmentServices)
                                        {
                                            var serviceName = s?.ServiceName ?? "Không rõ";
                                            var price = s?.Price ?? 0;

                                            table.Cell().Element(CellStyle).Text(serviceName);
                                            table.Cell().Element(CellStyle).Text(labRoom);
                                            table.Cell().Element(CellStyle).Text($"{price:#,##0} đ");
                                        }
                                    }
                                    else
                                    {
                                        table.Cell().Element(CellStyle).Text("Không có dịch vụ").Italic();
                                        table.Cell().Element(CellStyle).Text(labRoom);
                                        table.Cell().Element(CellStyle).Text("0 đ");
                                    }
                                }
                            }
                            else
                            {
                                table.Cell().ColumnSpan(3).AlignCenter().Text("Không có dịch vụ nào được chỉ định.").Italic();
                            }

                            IContainer CellStyle(IContainer container) =>
                                container.BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                        });

                        col.Item().PaddingTop(10).LineHorizontal(1);
                        col.Item().AlignRight().PaddingTop(5)
                            .Text($"Tổng tiền: {(appointment.TotalPrice ?? 0):#,##0} đ")
                            .FontSize(14).Bold().FontColor(Colors.Black);
                    });

                    // ======= FOOTER =======
                    page.Footer().AlignCenter().Text(txt =>
                    {
                        txt.Span("Cảm ơn quý khách đã đến khám tại Phòng khám Khánh An. ").Italic();
                        txt.Span("Chúc quý khách nhiều sức khỏe!").Bold();
                    });
                });
            });


            try
            {
                var pdfBytes = document.GeneratePdf();
                return pdfBytes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo hóa đơn cho appointment {AppointmentId}", appointmentId);
                throw;
            }
        }





    }
}
