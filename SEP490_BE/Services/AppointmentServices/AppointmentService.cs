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

        public AppointmentService(
            KhanhAnNeurologyClinicContext context,
            IAuthService authService,
            IRoleRepository roleRepository,
            IAuditLogRepository logRepository,
            IAppointmentRepository appointmentRepository,
            IUserRepository userRepository)
        {
            _context = context;
            _authService = authService;
            _roleRepository = roleRepository;
            _logRepository = logRepository;
            _appointmentRepository = appointmentRepository;
            _userRepository = userRepository;
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
                throw new ResourceNotFoundException(MessageConstants.NOT_FOUND);
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
            var requiredDoctor = await _userRepository.FindById(request.RequiredDoctorId);
            if (requiredDoctor == null)
            {
                throw new ResourceNotFoundException("Doctor not found");
            }
            var timeSlot = await _context.TimeSlots.FirstOrDefaultAsync(ts => ts.Id == request.TimeSlotId);
            if (timeSlot == null)
            {
                throw new ResourceNotFoundException("Timeslot not found");
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
                RequiredDoctorId = request.RequiredDoctorId,
                Date = request.Date,
                TimeSlotId = request.TimeSlotId,
                Status = AppointmentStatus.WAITING_FOR_CONFIRMATION,
                CreatedAt = DateTime.UtcNow,
                ExpiredAt = request.Date.Date.AddDays(1).AddMilliseconds(-1)
            };

            var appointmentResponseDTO = new AppointmentResponseDTO
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
            return appointmentResponseDTO;
        }
        public async Task<AppointmentResponseDTO> CreateByReceptionist(AppointmentRequestDTO request)
        {
            string newAppointmentId = Guid.NewGuid().ToString();
            var requiredDoctor = await _userRepository.FindById(request.RequiredDoctorId);
            if (requiredDoctor == null)
            {
                throw new ResourceNotFoundException("Doctor not found");
            }
            var timeSlot = await _context.TimeSlots.FirstOrDefaultAsync(ts => ts.Id == request.TimeSlotId);
            if (timeSlot == null)
            {
                throw new ResourceNotFoundException("Timeslot not found");
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
                RequiredDoctorId = request.RequiredDoctorId,
                Date = request.Date,
                TimeSlotId = request.TimeSlotId,
                Status = AppointmentStatus.CHECKED_IN,
                CreatedAt = DateTime.UtcNow,
                ExpiredAt = request.Date.Date.AddDays(1).AddMilliseconds(-1)
            };

            var appointmentResponseDTO = new AppointmentResponseDTO
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
            return appointmentResponseDTO;
        }
        public async Task<AppointmentResponseDTO> Update(string id, AppointmentRequestDTO request)
        {
            var appointment = await _appointmentRepository.FindById(id);
            if (appointment == null)
            {
                throw new ResourceNotFoundException(MessageConstants.NOT_FOUND);
            }
            var requiredDoctor = await _userRepository.FindById(request.RequiredDoctorId);
            if (requiredDoctor == null) {
                throw new ResourceNotFoundException("Doctor not found");
            }
            var timeSlot = await _context.TimeSlots.FirstOrDefaultAsync(ts => ts.Id == request.TimeSlotId);
            if (timeSlot == null)
            {
                throw new ResourceNotFoundException("Timeslot not found");
            }
            if (
                appointment.Status == AppointmentStatus.COMPLETED
                || appointment.Status == AppointmentStatus.CANCELLED
                )
            {
                throw new System.ArgumentException("This appointment cant be updated anymore.");
            }
            appointment.Name = request.Name;
            appointment.PhoneNumber = request.PhoneNumber;
            appointment.Email = request.Email;
            appointment.DateOfBirth = request.DateOfBirth;
            appointment.Gender = request.Gender;
            appointment.Address = request.Address;
            appointment.Symptom = request.Symptom;
            appointment.RequiredDoctorId = request.RequiredDoctorId;
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
                RequiredDoctorId = appointment.RequiredDoctorId,
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
        public async Task<AppointmentResponseDTO> UpdateStatus(string id, AppointmentStatusRequestDTO request)
        {
            var appointment = await _appointmentRepository.FindById(id);
            if (appointment == null)
            {
                throw new ResourceNotFoundException(MessageConstants.NOT_FOUND);
            }

            if (appointment.Status == AppointmentStatus.COMPLETED
                || appointment.Status == AppointmentStatus.CANCELLED){
                throw new System.ArgumentException("This appointment cant be updated anymore.");
            }

            if (appointment.Status == AppointmentStatus.WAITING_FOR_CONFIRMATION
                && request.Status != AppointmentStatus.WAITING_FOR_CHECK_IN
                && request.Status != AppointmentStatus.CANCELLED) {
                throw new System.ArgumentException("This appointment havent been confirmed yet.");
            }

            if (appointment.Status == AppointmentStatus.WAITING_FOR_CHECK_IN
                && request.Status != AppointmentStatus.CHECKED_IN
                && request.Status != AppointmentStatus.CANCELLED)
            {
                throw new System.ArgumentException("This appointment havent been checked in yet.");
            }

            if (appointment.Status == AppointmentStatus.PENDING
                && request.Status != AppointmentStatus.IN_PROGRESS
                && request.Status != AppointmentStatus.CANCELLED)
            {
                throw new System.ArgumentException("This appointment havent been paid yet.");
            }

            appointment.Status = request.Status;
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
    }
}
