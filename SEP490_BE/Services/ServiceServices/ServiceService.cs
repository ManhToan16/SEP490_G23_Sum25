using SEP490_BE.DTO.ServiceDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.ServiceRepositories;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using Microsoft.IdentityModel.Tokens;

namespace SEP490_BE.Services.ServiceServices
{
    public class ServiceService : IServiceService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IServiceRepository _serviceRepository;

        public ServiceService(
            KhanhAnNeurologyClinicContext context,
            IServiceRepository serviceRepository)
        {
            _context = context;
            _serviceRepository = serviceRepository;
        }

        public async Task<Pagination<ServiceResponseDTO>> GetAll(
            string? laboratoryRoomId,
            string? name,
            decimal? minPrice,
            decimal? maxPrice,
            string? description,
            int pageNumber,
            int pageSize)
        {
            var (services, totalItems) = await _serviceRepository.FindAll(laboratoryRoomId, name, minPrice, maxPrice, description, pageNumber, pageSize);
            return new Pagination<ServiceResponseDTO>
            {
                Items = services.Select(s => new ServiceResponseDTO
                {
                    Id = s.Id,
                    LaboratoryRoomId = s.LaboratoryRoomsId,
                    Name = s.Name,
                    Price = s.Price,
                    Description = s.Description
                }).ToList(),
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ServiceResponseDTO> GetById(string id)
        {
            var service = await _serviceRepository.FindByIdAsync(id);
            if (service == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy dịch vụ.");
            }
            return new ServiceResponseDTO
            {
                Id = service.Id,
                LaboratoryRoomId = service.LaboratoryRoomsId,
                Name = service.Name,
                Price = service.Price,
                Description = service.Description
            };
        }
        public async Task<ServiceResponseDTO> GetByRoom(string roomId)
        {
            var service = await _serviceRepository.FindByRoomAsync(roomId);
            if (service == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy dịch vụ trong phòng xét nghiệm này.");
            }
            return new ServiceResponseDTO
            {
                Id = service.Id,
                LaboratoryRoomId = service.LaboratoryRoomsId,
                Name = service.Name,
                Price = service.Price,
                Description = service.Description
            };
        }

        public async Task<ServiceResponseDTO> Create(CreateServiceDTO request)
        {
            if ( await _serviceRepository.ExistsByNameAsync(request.Name, request.LaboratoryRoomId))
            {
                throw new InvalidOperationException("Dịch vụ đã tồn tại trong phòng xét nghiệm này.");
            }

            var room = await _context.LaboratoryRooms.FindAsync(request.LaboratoryRoomId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy phòng xét nghiệm.");
            }
            if (request.Name.Length > 100)
            {
                throw new ValidationException("Tên dịch vụ không được vượt quá 100 ký tự");
            }

            var service = new Service
            {
                Id = Guid.NewGuid().ToString(),
                LaboratoryRoomsId = request.LaboratoryRoomId,
                Name = request.Name,
                Price = request.Price,
                Description = request.Description
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _serviceRepository.InsertAsync(service);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new ServiceResponseDTO
            {
                Id = service.Id,
                LaboratoryRoomId = service.LaboratoryRoomsId,
                Name = service.Name,
                Price = service.Price,
                Description = service.Description
            };
        }
        public async Task<bool> IsServiceExistsAsync(string name, string laboratoryRoomId)
        {
            return await _context.Services.AnyAsync(s =>
                s.Name.ToLower().Trim() == name.ToLower().Trim() &&
                s.LaboratoryRoomsId == laboratoryRoomId);
        }

        public async Task<ServiceResponseDTO> Update(string id, UpdateServiceDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new InvalidDataException("Tên dịch vụ không được để trống");
            }
            var service = await _serviceRepository.FindByIdAsync(id);
            if (service == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy dịch vụ.");
            }

            var room = await _context.LaboratoryRooms.FindAsync(request.LaboratoryRoomId ?? service.LaboratoryRoomsId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy phòng xét nghiệm.");
            }

            service.LaboratoryRoomsId = request.LaboratoryRoomId ?? service.LaboratoryRoomsId;
            service.Name = request.Name ?? service.Name;
            service.Price = request.Price ?? service.Price;
            service.Description = request.Description ?? service.Description;
            if (await _serviceRepository.ExistsByNameAsync(service.Name, service.LaboratoryRoomsId))
            {
                throw new InvalidOperationException("Dịch vụ đã tồn tại trong phòng xét nghiệm này.");
            }
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _serviceRepository.UpdateAsync(service);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new ServiceResponseDTO
            {
                Id = service.Id,
                LaboratoryRoomId = service.LaboratoryRoomsId,
                Name = service.Name,
                Price = service.Price,
                Description = service.Description
            };
        }

        public async Task Delete(string id)
        {
            var service = await _serviceRepository.FindByIdAsync(id);
            if (service == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy dịch vụ.");
            }

            await _serviceRepository.DeleteAsync(service);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteByLaboId(string laboratoryRoomId)
        {
            var services = await _context.Services
        .Where(s => s.LaboratoryRoomsId == laboratoryRoomId)
        .ToListAsync(); ;
            if (!services.Any())
            {
                throw new ResourceNotFoundException("Không tìm thấy dịch vụ trong phòng xét nghiệm này.");
            }
            _context.Services.RemoveRange(services);
            await _context.SaveChangesAsync();

        }
      
    }
}
