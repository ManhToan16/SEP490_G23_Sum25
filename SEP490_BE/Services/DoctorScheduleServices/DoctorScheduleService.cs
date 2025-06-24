using SEP490_BE.DTO.DoctorScheduleDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.DoctorScheduleRepositories;

namespace SEP490_BE.Services.DoctorScheduleServices
{
    public class DoctorScheduleService : IDoctorScheduleService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IDoctorScheduleRepository _doctorScheduleRepository;

        public DoctorScheduleService(
            KhanhAnNeurologyClinicContext context,
            IDoctorScheduleRepository doctorScheduleRepository)
        {
            _context = context;
            _doctorScheduleRepository = doctorScheduleRepository;
        }

        public async Task<Pagination<DoctorScheduleResponseDTO>> GetAll(
            string? doctorId,
            DateTime? date,
            bool? isAvailable,
            int pageNumber,
            int pageSize)
        {
            var (schedules, totalItems) = await _doctorScheduleRepository.FindAll(doctorId, date, isAvailable, pageNumber, pageSize);
            return new Pagination<DoctorScheduleResponseDTO>
            {
                Items = schedules.Select(ds => new DoctorScheduleResponseDTO
                {
                    Id = ds.Id,
                    DoctorId = ds.DoctorId,
                    ExaminationRoomId = ds.ExaminationRoomId,
                    Date = ds.Date,
                    StartTime = ds.StartTime,
                    EndTime = ds.EndTime,
                    IsAvailable = ds.IsAvailable
                }).ToList(),
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<DoctorScheduleResponseDTO> GetById(string id)
        {
            var schedule = await _doctorScheduleRepository.FindByIdAsync(id);
            if (schedule == null)
            {
                throw new ResourceNotFoundException("Doctor schedule not found.");
            }
            return new DoctorScheduleResponseDTO
            {
                Id = schedule.Id,
                DoctorId = schedule.DoctorId,
                ExaminationRoomId = schedule.ExaminationRoomId,
                Date = schedule.Date,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime,
                IsAvailable = schedule.IsAvailable
            };
        }

        public async Task<DoctorScheduleResponseDTO> Create(CreateDoctorScheduleDTO request)
        {
            var existingSchedule = await _doctorScheduleRepository.FindByDoctorIdAndDateAsync(request.DoctorId, request.Date);
            if (existingSchedule != null)
            {
                throw new ConflictDataException("Doctor already has a schedule for this date.");
            }

            var doctor = await _context.Users.FindAsync(request.DoctorId);
            if (doctor == null)
            {
                throw new ResourceNotFoundException("Doctor not found.");
            }

            var room = await _context.ExaminationRooms.FindAsync(request.ExaminationRoomId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Examination room not found.");
            }

            if (request.StartTime >= request.EndTime)
            {
                throw new ArgumentException("Start time must be before end time.");
            }

            var doctorSchedule = new DoctorSchedule
            {
                Id = Guid.NewGuid().ToString(),
                DoctorId = request.DoctorId,
                ExaminationRoomId = request.ExaminationRoomId,
                Date = request.Date,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                IsAvailable = request.IsAvailable
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _doctorScheduleRepository.InsertAsync(doctorSchedule);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new DoctorScheduleResponseDTO
            {
                Id = doctorSchedule.Id,
                DoctorId = doctorSchedule.DoctorId,
                ExaminationRoomId = doctorSchedule.ExaminationRoomId,
                Date = doctorSchedule.Date,
                StartTime = doctorSchedule.StartTime,
                EndTime = doctorSchedule.EndTime,
                IsAvailable = doctorSchedule.IsAvailable
            };
        }

        public async Task<DoctorScheduleResponseDTO> Update(string id, UpdateDoctorScheduleDTO request)
        {
            var schedule = await _doctorScheduleRepository.FindByIdAsync(id);
            if (schedule == null)
            {
                throw new ResourceNotFoundException("Doctor schedule not found.");
            }

            var existingSchedule = await _doctorScheduleRepository.FindByDoctorIdAndDateAsync(schedule.DoctorId, request.Date ?? schedule.Date);
            if (existingSchedule != null && existingSchedule.Id != id)
            {
                throw new ConflictDataException("Doctor already has a schedule for this date.");
            }

            var room = await _context.ExaminationRooms.FindAsync(request.ExaminationRoomId ?? schedule.ExaminationRoomId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Examination room not found.");
            }

            if (request.StartTime.HasValue && request.EndTime.HasValue && request.StartTime.Value >= request.EndTime.Value)
            {
                throw new ArgumentException("Start time must be before end time.");
            }

            schedule.ExaminationRoomId = request.ExaminationRoomId ?? schedule.ExaminationRoomId;
            schedule.Date = request.Date ?? schedule.Date;
            schedule.StartTime = request.StartTime ?? schedule.StartTime;
            schedule.EndTime = request.EndTime ?? schedule.EndTime;
            schedule.IsAvailable = request.IsAvailable ?? schedule.IsAvailable;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _doctorScheduleRepository.UpdateAsync(schedule);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new DoctorScheduleResponseDTO
            {
                Id = schedule.Id,
                DoctorId = schedule.DoctorId,
                ExaminationRoomId = schedule.ExaminationRoomId,
                Date = schedule.Date,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime,
                IsAvailable = schedule.IsAvailable
            };
        }

        public async Task Delete(string id)
        {
            var schedule = await _doctorScheduleRepository.FindByIdAsync(id);
            if (schedule == null)
            {
                throw new ResourceNotFoundException("Doctor schedule not found.");
            }

            await _doctorScheduleRepository.DeleteAsync(schedule);
            await _context.SaveChangesAsync();
        }
    }
}
