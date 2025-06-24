using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.ExaminationRoomRepositories;

namespace SEP490_BE.Services.ExaminationRoomServices
{
    public class ExaminationRoomService : IExaminationRoomService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IExaminationRoomRepository _examinationRoomRepository;

        public ExaminationRoomService(
            KhanhAnNeurologyClinicContext context,
            IExaminationRoomRepository examinationRoomRepository)
        {
            _context = context;
            _examinationRoomRepository = examinationRoomRepository;
        }

        public async Task<Pagination<ExaminationRoomResponseDTO>> GetAll(
            string? name,
            string? description,
            int pageNumber,
            int pageSize)
        {
            var (rooms, totalItems) = await _examinationRoomRepository.FindAll(name, description, pageNumber, pageSize);
            return new Pagination<ExaminationRoomResponseDTO>
            {
                Items = rooms.Select(er => new ExaminationRoomResponseDTO
                {
                    Id = er.Id,
                    Name = er.Name,
                    Description = er.Description,
                    DoctorScheduleCount = er.DoctorSchedules?.Count ?? 0,
                    QueueCount = er.Queues?.Count ?? 0
                }).ToList(),
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ExaminationRoomResponseDTO> GetById(string id)
        {
            var room = await _examinationRoomRepository.FindByIdAsync(id);
            if (room == null)
            {
                throw new ResourceNotFoundException("Examination room not found.");
            }
            return new ExaminationRoomResponseDTO
            {
                Id = room.Id,
                Name = room.Name,
                Description = room.Description,
                DoctorScheduleCount = room.DoctorSchedules?.Count ?? 0,
                QueueCount = room.Queues?.Count ?? 0
            };
        }

        public async Task<ExaminationRoomResponseDTO> Create(CreateExaminationRoomDTO request)
        {
            var existingRoom = await _examinationRoomRepository.FindByIdAsync(request.Id);
            if (existingRoom != null)
            {
                throw new ConflictDataException("Examination room already exists.");
            }

            var room = new ExaminationRoom
            {
                Id = request.Id,
                Name = request.Name,
                Description = request.Description
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _examinationRoomRepository.InsertAsync(room);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new ExaminationRoomResponseDTO
            {
                Id = room.Id,
                Name = room.Name,
                Description = room.Description,
                DoctorScheduleCount = 0,
                QueueCount = 0
            };
        }

        public async Task<ExaminationRoomResponseDTO> Update(string id, UpdateExaminationRoomDTO request)
        {
            var room = await _examinationRoomRepository.FindByIdAsync(id);
            if (room == null)
            {
                throw new ResourceNotFoundException("Examination room not found.");
            }

            room.Name = request.Name ?? room.Name;
            room.Description = request.Description ?? room.Description;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _examinationRoomRepository.UpdateAsync(room);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new ExaminationRoomResponseDTO
            {
                Id = room.Id,
                Name = room.Name,
                Description = room.Description,
                DoctorScheduleCount = room.DoctorSchedules?.Count ?? 0,
                QueueCount = room.Queues?.Count ?? 0
            };
        }

        public async Task Delete(string id)
        {
            var room = await _examinationRoomRepository.FindByIdAsync(id);
            if (room == null)
            {
                throw new ResourceNotFoundException("Examination room not found.");
            }

            await _examinationRoomRepository.DeleteAsync(room);
            await _context.SaveChangesAsync();
        }
    }
}
