using SEP490_BE.DTO.LaboratoryRoomDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.LaboratoryRoomRepositories;
using Microsoft.EntityFrameworkCore;
using SEP490_BE.Services.ServiceServices;

namespace SEP490_BE.Services.LaboratoryRoomServices
{
    public class LaboratoryRoomService : ILaboratoryRoomService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly ILaboratoryRoomRepository _laboratoryRoomRepository;
        private readonly IServiceService _serviceService;

        public LaboratoryRoomService(
            KhanhAnNeurologyClinicContext context,
            ILaboratoryRoomRepository laboratoryRoomRepository, IServiceService serviceService)
        {
            _context = context;
            _laboratoryRoomRepository = laboratoryRoomRepository;
            _serviceService = serviceService;
        }

        public async Task<Pagination<LaboratoryRoomResponseDTO>> GetAll(
            string? name,
            string? description,
            int pageNumber,
            int pageSize)
        {
            var (rooms, totalItems) = await _laboratoryRoomRepository.FindAll(name, description, pageNumber, pageSize);
            return new Pagination<LaboratoryRoomResponseDTO>
            {
                Items = rooms.Select(lr => new LaboratoryRoomResponseDTO
                {
                    Id = lr.Id,
                    Name = lr.Name,
                    Description = lr.Description
                }).ToList(),
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<LaboratoryRoomResponseDTO> GetById(string id)
        {
            var room = await _laboratoryRoomRepository.FindByIdAsync(id);
            if (room == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy phòng cận lâm sàng.");
            }
            return new LaboratoryRoomResponseDTO
            {
                Id = room.Id,
                Name = room.Name,
                Description = room.Description
            };
        }

        public async Task<LaboratoryRoomResponseDTO> Create(CreateLaboratoryRoomDTO request)
        {
            if (await _laboratoryRoomRepository.ExistsByNameAsync(request.Name))
            {
                throw new InvalidOperationException("Tên phòng đã tồn tại");
            }
            var room = new LaboratoryRoom
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Description = request.Description
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _laboratoryRoomRepository.InsertAsync(room);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new LaboratoryRoomResponseDTO
            {
                Id = room.Id,
                Name = room.Name,
                Description = room.Description
            };
        }
        public async Task<bool> IsLaboratoryRoomExistsAsync(string name)
        {
            return await _context.LaboratoryRooms
                .AnyAsync(r => r.Name.ToLower().Trim() == name.ToLower().Trim());
        }

        public async Task<LaboratoryRoomResponseDTO> Update(string id, UpdateLaboratoryRoomDTO request)
        {
            var room = await _laboratoryRoomRepository.FindByIdAsync(id);
            if (room == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy phòng cận lâm sàng.");
            }

            room.Name = request.Name ?? room.Name;
            room.Description = request.Description ?? room.Description;
            if (await _laboratoryRoomRepository.ExistsByNameAsync(room.Name))
            {
                throw new InvalidOperationException("Tên phòng đã tồn tại");
            }
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _laboratoryRoomRepository.UpdateAsync(room);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new LaboratoryRoomResponseDTO
            {
                Id = room.Id,
                Name = room.Name,
                Description = room.Description
            };
        }

        public async Task Delete(string id)
        {
            var room = await _laboratoryRoomRepository.FindByIdAsync(id);
            if (room == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy phòng cận lâm sàng.");
            }
            await _serviceService.DeleteByLaboId(id);
            await _laboratoryRoomRepository.DeleteAsync(room);
            await _context.SaveChangesAsync();
        }

    }
}
