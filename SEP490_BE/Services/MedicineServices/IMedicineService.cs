using SEP490_BE.DTO.MedicineDTO;
using SEP490_BE.DTO;

namespace SEP490_BE.Services.MedicineServices
{
    public interface IMedicineService
    {
        Task<MedicineResponseDTO> CreateMedicine(CreateMedicineDTO request);
        Task<MedicineResponseDTO> UpdateMedicine(string id, UpdateMedicineDTO request);
        Task DeleteMedicine(string id);
        Task<MedicineResponseDTO> GetMedicineById(string id);
        Task<Pagination<MedicineResponseDTO>> GetAllMedicine(string? name, string? description, int pageNumber, int pageSize);
        Task<List<MedicineResponseDTO>> GetActiveMedicinesAsync();
        Task ActiveMedicine(string id);
    }
}
