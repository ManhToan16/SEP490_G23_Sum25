using SEP490_BE.DTO.MedicineDTO;
using SEP490_BE.DTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.MedicineRepositories;
using Microsoft.EntityFrameworkCore;

namespace SEP490_BE.Services.MedicineServices
{
    public class MedicineService : IMedicineService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IMedicineRepository _medicineRepository;

        public MedicineService(KhanhAnNeurologyClinicContext context, IMedicineRepository medicineRepository)
        {
            _context = context;
            _medicineRepository = medicineRepository;
        }

        public async Task<MedicineResponseDTO> CreateMedicine(CreateMedicineDTO request)
        {
            var medicine = new Medicine
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                ActiveIngredients = request.ActiveIngredients,
                Strength = request.Strength,
                Packaging = request.Packaging,
                Unit = request.Unit,
                Description = request.Description
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _medicineRepository.AddAsync(medicine);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return MapToResponseDTO(medicine);
        }

        public async Task<MedicineResponseDTO> UpdateMedicine(string id, UpdateMedicineDTO request)
        {
            var medicine = await _medicineRepository.FindByIdAsync(id);
            if (medicine == null)
            {
                throw new ResourceNotFoundException("Thuốc không tồn tại.");
            }

            medicine.Name = request.Name ?? medicine.Name;
            medicine.ActiveIngredients = request.ActiveIngredients ?? medicine.ActiveIngredients;
            medicine.Strength = request.Strength ?? medicine.Strength;
            medicine.Packaging = request.Packaging ?? medicine.Packaging;
            medicine.Unit = request.Unit ?? medicine.Unit;
            medicine.Description = request.Description ?? medicine.Description;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _medicineRepository.UpdateAsync(medicine);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch 
            {
                await transaction.RollbackAsync();
                throw;
            }
            return MapToResponseDTO(medicine);

        }

        public async Task DeleteMedicine(string id)
        {
            var medicine = await _medicineRepository.FindByIdAsync(id);
            if (medicine == null)
            {
                throw new ResourceNotFoundException("Thuốc không tồn tại.");
            }
                await _medicineRepository.DeleteAsync(medicine);
                await _context.SaveChangesAsync();

        }

        public async Task<MedicineResponseDTO> GetMedicineById(string id)
        {
            var medicine = await _medicineRepository.FindByIdAsync(id);
            if (medicine == null)
            {
                throw new ResourceNotFoundException("Thuốc không tồn tại.");
            }

            return MapToResponseDTO(medicine);
        }

        public async Task<Pagination<MedicineResponseDTO>> GetAllMedicine(string? name, string? description, int pageNumber, int pageSize)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var (medicines, totalItems) = await _medicineRepository.FindAll(name, description, pageNumber, pageSize);
            var responseDtos = medicines.Select(MapToResponseDTO).ToList();
            return new Pagination<MedicineResponseDTO>
            {
                Items = responseDtos,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        private MedicineResponseDTO MapToResponseDTO(Medicine medicine)
        {
            return new MedicineResponseDTO
            {
                Id = medicine.Id,
                Name = medicine.Name,
                ActiveIngredients = medicine.ActiveIngredients,
                Strength = medicine.Strength,
                Packaging = medicine.Packaging,
                Unit = medicine.Unit,
                Description = medicine.Description
            };
        }
    }
}
