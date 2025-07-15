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

namespace SEP490_BE.Services.AppointmentServices
{
    public class AppointmentService : IAppointmentService
    {

        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IAuthService _authService;
        private readonly IRoleRepository _roleRepository;
        private readonly IAuditLogRepository _logRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly IVisitRepository _visitRepository;

        public AppointmentService(
            KhanhAnNeurologyClinicContext context,
            IAuthService authService,
            IRoleRepository roleRepository,
            IAuditLogRepository logRepository,
            IAppointmentRepository appointmentRepository,
            IUserRepository userRepository,
            IEmailService emailService,
            IVisitRepository visitRepository)
        {
            _context = context;
            _authService = authService;
            _roleRepository = roleRepository;
            _logRepository = logRepository;
            _appointmentRepository = appointmentRepository;
            _userRepository = userRepository;
            _emailService = emailService;
            _visitRepository = visitRepository;
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
            if (appointment.Status != AppointmentStatus.WAITING_FOR_CONFIRMATION || appointment.Status != AppointmentStatus.WAITING_FOR_CHECK_IN)
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
                if (visit != null)
                {
                    visit.Status = VisitStatus.CANCELLED;
                    await _visitRepository.Update(visit);

                    var assignments = await _context.Assignments
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
        
        public Task PrintInvoice(string id)
        {
            throw new NotImplementedException();
        }
    }
}
