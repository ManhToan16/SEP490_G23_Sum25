using SEP490_BE.DTO.TechnicianScheduleDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.TechinicianScheduleRepositories;

namespace SEP490_BE.Services.TechnicianScheduleServices
{
    public class TechnicianScheduleService : ITechnicianScheduleService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly ITechnicianScheduleRepository _technicianScheduleRepository;

        public TechnicianScheduleService(
            KhanhAnNeurologyClinicContext context,
            ITechnicianScheduleRepository technicianScheduleRepository)
        {
            _context = context;
            _technicianScheduleRepository = technicianScheduleRepository;
        }

        public async Task<Pagination<TechnicianScheduleResponseDTO>> GetAll(
            string? technicianId,
            DateTime? date,
            int pageNumber,
            int pageSize)
        {
            var (schedules, totalItems) = await _technicianScheduleRepository.FindAll(technicianId, date, pageNumber, pageSize);
            return new Pagination<TechnicianScheduleResponseDTO>
            {
                Items = schedules.Select(ts => new TechnicianScheduleResponseDTO
                {
                    Id = ts.Id,
                    TechnicianId = ts.TechnicianId,
                    LaboratoryRoomId = ts.LaboratoryRoomId,
                    Date = ts.Date,
                    StartTime = ts.StartTime,
                    EndTime = ts.EndTime
                }).ToList(),
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<TechnicianScheduleResponseDTO> GetById(string id)
        {
            var schedule = await _technicianScheduleRepository.FindByIdAsync(id);
            if (schedule == null)
            {
                throw new ResourceNotFoundException("Technician schedule not found.");
            }
            return new TechnicianScheduleResponseDTO
            {
                Id = schedule.Id,
                TechnicianId = schedule.TechnicianId,
                LaboratoryRoomId = schedule.LaboratoryRoomId,
                Date = schedule.Date,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime
            };
        }

        public async Task<TechnicianScheduleResponseDTO> Create(CreateTechnicianScheduleDTO request)
        {
            var existingSchedule = await _technicianScheduleRepository.FindByTechnicianIdAndDateAsync(request.TechnicianId, request.Date);
            if (existingSchedule != null)
            {
                throw new ConflictDataException("Technician already has a schedule for this date.");
            }

            var roomSchedule = await _technicianScheduleRepository.FindByRoomAndDateAsync(request.LaboratoryRoomId, request.Date);
            if (roomSchedule != null)
            {
                throw new ConflictDataException("This laboratory room is already scheduled for another technician on this date.");
            }

            var technician = await _context.Users.FindAsync(request.TechnicianId);
            if (technician == null)
            {
                throw new ResourceNotFoundException("Technician not found.");
            }

            var room = await _context.LaboratoryRooms.FindAsync(request.LaboratoryRoomId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Laboratory room not found.");
            }

            if (request.StartTime >= request.EndTime)
            {
                throw new SEP490_BE.Exceptions.ArgumentException("Start time must be before end time.");
            }

            var technicianSchedule = new TechnicianSchedule
            {
                Id = Guid.NewGuid().ToString(),
                TechnicianId = request.TechnicianId,
                LaboratoryRoomId = request.LaboratoryRoomId,
                Date = request.Date,
                StartTime = request.StartTime,
                EndTime = request.EndTime
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _technicianScheduleRepository.InsertAsync(technicianSchedule);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new TechnicianScheduleResponseDTO
            {
                Id = technicianSchedule.Id,
                TechnicianId = technicianSchedule.TechnicianId,
                LaboratoryRoomId = technicianSchedule.LaboratoryRoomId,
                Date = technicianSchedule.Date,
                StartTime = technicianSchedule.StartTime,
                EndTime = technicianSchedule.EndTime
            };
        }

        public async Task<TechnicianScheduleResponseDTO> Update(string id, UpdateTechnicianScheduleDTO request)
        {
            var schedule = await _technicianScheduleRepository.FindByIdAsync(id);
            if (schedule == null)
            {
                throw new ResourceNotFoundException("Technician schedule not found.");
            }

            var existingSchedule = await _technicianScheduleRepository.FindByTechnicianIdAndDateAsync(schedule.TechnicianId, request.Date ?? schedule.Date);
            if (existingSchedule != null && existingSchedule.Id != id)
            {
                throw new ConflictDataException("Technician already has a schedule for this date.");
            }

            var roomSchedule = await _technicianScheduleRepository.FindByRoomAndDateAsync(schedule.LaboratoryRoomId, request.Date ?? schedule.Date);
            if (roomSchedule != null && roomSchedule.Id != id)
            {
                throw new ConflictDataException("This laboratory room is already scheduled for another technician on this date.");
            }

            var room = await _context.LaboratoryRooms.FindAsync(request.LaboratoryRoomId ?? schedule.LaboratoryRoomId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Laboratory room not found.");
            }

            if (request.StartTime.HasValue && request.EndTime.HasValue && request.StartTime.Value >= request.EndTime.Value)
            {
                throw new SEP490_BE.Exceptions.ArgumentException("Start time must be before end time.");
            }

            schedule.LaboratoryRoomId = request.LaboratoryRoomId ?? schedule.LaboratoryRoomId;
            schedule.Date = request.Date ?? schedule.Date;
            schedule.StartTime = request.StartTime ?? schedule.StartTime;
            schedule.EndTime = request.EndTime ?? schedule.EndTime;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _technicianScheduleRepository.UpdateAsync(schedule);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new TechnicianScheduleResponseDTO
            {
                Id = schedule.Id,
                TechnicianId = schedule.TechnicianId,
                LaboratoryRoomId = schedule.LaboratoryRoomId,
                Date = schedule.Date,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime
            };
        }

        public async Task Delete(string id)
        {
            var schedule = await _technicianScheduleRepository.FindByIdAsync(id);
            if (schedule == null)
            {
                throw new ResourceNotFoundException("Technician schedule not found.");
            }

            await _technicianScheduleRepository.DeleteAsync(schedule);
            await _context.SaveChangesAsync();
        }
    }
}
