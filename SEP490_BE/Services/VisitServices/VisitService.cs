using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.AppointmentDTO;
using SEP490_BE.DTO.VisitDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AppointmentRepositories;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.RoleRepositories;
using SEP490_BE.Repositories.UserRepositories;
using SEP490_BE.Repositories.VisitRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.EmailServices;
using ArgumentException = SEP490_BE.Exceptions.ArgumentException;

namespace SEP490_BE.Services.VisitServices
{
    public class VisitService : IVisitService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IAuthService _authService;
        private readonly IAuditLogRepository _logRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly IVisitRepository _visitRepository;

        public VisitService(
            KhanhAnNeurologyClinicContext context,
            IAuthService authService,
            IAuditLogRepository logRepository,
            IAppointmentRepository appointmentRepository,
            IUserRepository userRepository,
            IEmailService emailService,
            IVisitRepository visitRepository)
        {
            _context = context;
            _authService = authService;
            _logRepository = logRepository;
            _appointmentRepository = appointmentRepository;
            _userRepository = userRepository;
            _emailService = emailService;
            _visitRepository = visitRepository;
        }
        public async Task<VisitResponseDTO> Create(VisitRequestDTO request)
        {
            var examinationRoom = await _context.ExaminationRooms.FindAsync(request.ExaminationRoomId);
            if (examinationRoom == null)
                throw new ResourceNotFoundException(MessageConstants.EXAM_ROOM_NOT_FOUND);

            var patientProfile = await _context.PatientProfiles.FindAsync(request.PatientProfileId);
            if (patientProfile == null)
                throw new ResourceNotFoundException(MessageConstants.PATIENT_PROTILE_NOT_FOUND);

            var appointment = await _context.Appointments.FindAsync(request.AppointmentId);
            if (appointment == null)
                throw new ResourceNotFoundException(MessageConstants.APPOINTMENT_NOT_FOUND);

            if (appointment.ExpiredAt.HasValue && appointment.ExpiredAt.Value < DateTime.UtcNow)
                throw new ArgumentException(MessageConstants.APPOINTMENT_EXPIRED);

            var today = DateTime.UtcNow.Date;
            if (appointment.Date.Date != today)
                throw new ArgumentException(MessageConstants.APPOINTMENT_INVALID_CREATE_VISIT);

            var assignedDoctor = await _context.Users.FindAsync(request.AssignedDoctorId);
            if (assignedDoctor == null)
                throw new ResourceNotFoundException(MessageConstants.DOCTOR_NOT_FOUND);

            var todayVisits = await _context.Visits
                .Where(v => v.ExaminationRoomId == request.ExaminationRoomId && v.CreateAt.HasValue && v.CreateAt.Value.Date == today)
                .ToListAsync();

            int nextQueueNumber = todayVisits.Any() ? todayVisits.Max(v => v.QueueNumber) + 1 : 1;

            var visit = new Visit
            {
                Id = Guid.NewGuid().ToString(),
                ExaminationRoomId = request.ExaminationRoomId,
                AppointmentId = request.AppointmentId,
                PatientProfileId = request.PatientProfileId,
                AssignedDoctorId = request.AssignedDoctorId,
                PatientName = patientProfile.Name,
                TotalPrice = appointment.TotalPrice,
                IsPrioritized = request.IsPrioritized,
                QueueNumber = nextQueueNumber,
                Status = VisitStatus.WAITING,
                CreateAt = DateTime.UtcNow
            };
            appointment.Status = AppointmentStatus.IN_EXAMINATION_PROGRESS;
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _visitRepository.Insert(visit);
                await _appointmentRepository.Update(appointment);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch {
                await transaction.RollbackAsync();
                throw;
            }
            return new VisitResponseDTO
            {
                ExaminationRoomId = visit.ExaminationRoomId,
                ExaminationRoomName = visit.ExaminationRoom.Name,
                AppointmentId = visit.AppointmentId,
                AssignedDoctorId = visit.AssignedDoctorId,
                AssignedDoctorName = visit.AssignedDoctor.Name,
                PatientProfileId = visit.PatientProfileId,
                PatientName = visit.PatientName,
                QueueNumber = visit.QueueNumber,
                TotalPrice = visit.TotalPrice ?? 0,
                Status = visit.Status ?? string.Empty,
                IsPrioritized = visit.IsPrioritized ?? false
            };
        }

        public async Task<VisitResponseDTO> GetById(string id)
        {
            var visit = await _visitRepository.FindById(id);
            if (visit == null)
                throw new ResourceNotFoundException(MessageConstants.VISIT_NOT_FOUND);

            return new VisitResponseDTO
            {
                ExaminationRoomId = visit.ExaminationRoomId,
                ExaminationRoomName = visit.ExaminationRoom.Name,
                AppointmentId = visit.AppointmentId,
                AssignedDoctorId = visit.AssignedDoctorId,
                AssignedDoctorName = visit.AssignedDoctor.Name,
                PatientProfileId = visit.PatientProfileId,
                PatientName = visit.PatientName,
                QueueNumber = visit.QueueNumber,
                TotalPrice = visit.TotalPrice ?? 0,
                Status = visit.Status ?? "",
                IsPrioritized = visit.IsPrioritized ?? false
            };
        }

        public async Task<Pagination<VisitResponseDTO>> GetVisits(string examinationRoomId, string? status, DateTime date, int pageNumber, int pageSize)
        {
            var (visits, totalItems) = await _visitRepository.GetVisits(examinationRoomId, status, date, pageNumber, pageSize);
            return new Pagination<VisitResponseDTO>
            {
                Items = visits,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<VisitResponseDTO> MarkAsComplete(string id)
        {
            var visit = await _visitRepository.FindById(id);
            if (visit == null)
                throw new ResourceNotFoundException(MessageConstants.VISIT_NOT_FOUND);

            if (visit.Status != VisitStatus.RETURNING)
                throw new ArgumentException(MessageConstants.VISIT_INVALID_COMPLETED);

            var incompleteAssignments = await _context.Assignments
                .Where(a => a.VisitId == visit.Id && a.Status != AssignmentStatus.COMPLETED)
                .ToListAsync();
            if (incompleteAssignments.Any())
                throw new InvalidOperationException(MessageConstants.VISIT_INVALID_COMPLETED);

            visit.Status = VisitStatus.COMPLETED;
            visit.Appointment.Status = AppointmentStatus.COMPLETED;

            // Logic: không thể complete visit khi chưa có phiếu kết quả khám exam result
            string accessCode = "(Sẽ bổ sung access code sau)";

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _visitRepository.Update(visit);
                await _appointmentRepository.Update(visit.Appointment); 
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            var htmlContent = $@"
                <h2>Kết quả khám bệnh</h2>
                <p>Xin chào <strong>{visit.Appointment.Name}</strong>,</p>
                <p>Lượt khám của bạn tại <strong>Khanh An Neurology Clinic</strong> đã hoàn tất.</p>
                <p>Mã truy cập phiếu khám của bạn: <strong>{accessCode}</strong></p>
                <p>Trân trọng,<br/>Khanh An Neurology Clinic</p>";

            await _emailService.SendAsync(
                visit.Appointment.Email,
                "Kết quả khám tại Khanh An Neurology Clinic",
                htmlContent);
            return new VisitResponseDTO
            {
                ExaminationRoomId = visit.ExaminationRoomId,
                ExaminationRoomName = visit.ExaminationRoom.Name,
                AppointmentId = visit.AppointmentId,
                AssignedDoctorId = visit.AssignedDoctorId,
                AssignedDoctorName = visit.AssignedDoctor.Name,
                PatientProfileId = visit.PatientProfileId,
                PatientName = visit.PatientName,
                QueueNumber = visit.QueueNumber,
                TotalPrice = visit.TotalPrice ?? 0,
                Status = visit.Status ?? "",
                IsPrioritized = visit.IsPrioritized ?? false
            };
        }

        public async Task<VisitResponseDTO> Calling(string id)
        {
            var visit = await _visitRepository.FindById(id);
            if (visit == null)
                throw new ResourceNotFoundException(MessageConstants.VISIT_NOT_FOUND);

            if (visit.Status != VisitStatus.WAITING)
                throw new ArgumentException(MessageConstants.VISIT_INVALID_CALLING);

            visit.Status = VisitStatus.IN_EXAMINATION;
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _visitRepository.Update(visit);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return new VisitResponseDTO
            {
                ExaminationRoomId = visit.ExaminationRoomId,
                ExaminationRoomName = visit.ExaminationRoom.Name,
                AppointmentId = visit.AppointmentId,
                AssignedDoctorId = visit.AssignedDoctorId,
                AssignedDoctorName = visit.AssignedDoctor.Name,
                PatientProfileId = visit.PatientProfileId,
                PatientName = visit.PatientName,
                QueueNumber = visit.QueueNumber,
                TotalPrice = visit.TotalPrice ?? 0,
                Status = visit.Status ?? "",
                IsPrioritized = visit.IsPrioritized ?? false
            };
        }

        public async Task<VisitResponseDTO> GetByAppointmentId(string appointmentId)
        {
            var visit = await _visitRepository.FindByAppointmentId(appointmentId);
            if (visit == null)
                throw new ResourceNotFoundException(MessageConstants.VISIT_NOT_FOUND);

            return new VisitResponseDTO
            {
                ExaminationRoomId = visit.ExaminationRoomId,
                ExaminationRoomName = visit.ExaminationRoom.Name,
                AppointmentId = visit.AppointmentId,
                AssignedDoctorId = visit.AssignedDoctorId,
                AssignedDoctorName = visit.AssignedDoctor.Name,
                PatientProfileId = visit.PatientProfileId,
                PatientName = visit.PatientName,
                QueueNumber = visit.QueueNumber,
                TotalPrice = visit.TotalPrice ?? 0,
                Status = visit.Status ?? "",
                IsPrioritized = visit.IsPrioritized ?? false
            };
        }


    }
}
