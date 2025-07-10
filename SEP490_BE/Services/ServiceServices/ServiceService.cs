using SEP490_BE.DTO.ServiceDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.ServiceRepositories;

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
                throw new ResourceNotFoundException("Service not found.");
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
            var existingService = await _serviceRepository.FindByIdAsync(Guid.NewGuid().ToString());
            if (existingService != null)
            {
                throw new ConflictDataException("Service already exists.");
            }

            var room = await _context.LaboratoryRooms.FindAsync(request.LaboratoryRoomId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Laboratory room not found.");
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

        public async Task<ServiceResponseDTO> Update(string id, UpdateServiceDTO request)
        {
            var service = await _serviceRepository.FindByIdAsync(id);
            if (service == null)
            {
                throw new ResourceNotFoundException("Service not found.");
            }

            var room = await _context.LaboratoryRooms.FindAsync(request.LaboratoryRoomId ?? service.LaboratoryRoomsId);
            if (room == null)
            {
                throw new ResourceNotFoundException("Laboratory room not found.");
            }

            service.LaboratoryRoomsId = request.LaboratoryRoomId ?? service.LaboratoryRoomsId;
            service.Name = request.Name ?? service.Name;
            service.Price = request.Price ?? service.Price;
            service.Description = request.Description ?? service.Description;

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
                throw new ResourceNotFoundException("Service not found.");
            }

            await _serviceRepository.DeleteAsync(service);
            await _context.SaveChangesAsync();
        }
    }
}
