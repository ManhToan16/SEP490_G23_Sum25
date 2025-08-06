using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO.LaboratoryResultDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AssignmentRepositories;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Repositories.LaboratoryResultRepositories;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Services.FileServices;
using System;

namespace SEP490_BE.Services.LaboratoryResultServices
{
    public class LaboratoryResultService : ILaboratoryResultService
    {
        private readonly ILaboratoryResultRepository _resultRepo;
        private readonly ILaboratoryFileRepository _fileRepo;
        private readonly IAssignmentRepository _assignmentRepo;
        private readonly IFileService _fileService;
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;
        private readonly IAuditLogRepository _logRepository;

        public LaboratoryResultService(
            ILaboratoryResultRepository resultRepo,
            ILaboratoryFileRepository fileRepo,
            IAssignmentRepository assignmentRepo,
            IFileService fileService,
            IAuthService authService,
            KhanhAnNeurologyClinicContext context,
            IConfiguration configuration,
            IAuditLogRepository auditLogRepository)
        {
            _resultRepo = resultRepo;
            _fileRepo = fileRepo;
            _assignmentRepo = assignmentRepo;
            _fileService = fileService;
            _context = context;
            _authService = authService;
            _configuration = configuration;
            _logRepository = auditLogRepository;
        }

        public async Task<LaboratoryResultResponseDTO> CreateByAssignmentId(string assignmentId, LaboratoryResultRequestDTO requestDTO)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Visit)
                    .ThenInclude(v => v.ExaminationResults)
                .FirstOrDefaultAsync(a => a.Id == assignmentId);

            if (assignment == null)
                throw new ResourceNotFoundException(MessageConstants.ASSIGNMENT_NOT_FOUND);

            if (assignment.Status == AssignmentStatus.COMPLETED
                 || assignment.Status == AssignmentStatus.COMPLETED)
            {
                throw new Exceptions.ArgumentException(MessageConstants.LABORATORY_RESULT_INVALID_UPDATE);
            }

            var examinationResult = assignment.Visit?.ExaminationResults?.FirstOrDefault();
            if (examinationResult == null)
                throw new Exception(MessageConstants.EXAMINATION_RESULT_NOT_FOUND);

            var technician = await _authService.GetAuthenticatedUser();

            var result = new LaboratoryResult
            {
                Id = Guid.NewGuid().ToString(),
                AssignmentId = assignmentId,
                TechnicianId = technician.Id,
                Note = requestDTO.Note,
                ExaminationResultId = examinationResult.Id,
                UpdatedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            using var transaction = await _context.Database.BeginTransactionAsync(); // [AUDIT]
            try
            {
                _context.LaboratoryResults.Add(result);
                await _context.SaveChangesAsync();

                var response = MapToDto(result); // [AUDIT]
                await _logRepository.LogAsync(technician.Id, "CREATE", "LaboratoryResults", result.Id, null, response); // [AUDIT]

                await transaction.CommitAsync(); // [AUDIT]
                return response;
            }
            catch
            {
                await transaction.RollbackAsync(); // [AUDIT]
                throw;
            }
        }


        public async Task<LaboratoryResultResponseDTO> GetByAssignmentId(string assignmentId)
        {
            var entity = await _resultRepo.GetByAssignmentIdAsync(assignmentId)
                ?? throw new ResourceNotFoundException(MessageConstants.LABORATORY_RESULT_NOT_FOUND);
            return MapToDto(entity);
        }

        public async Task<LaboratoryResultResponseDTO> GetById(string id)
        {
            var entity = await _resultRepo.GetByIdAsync(id)
                ?? throw new ResourceNotFoundException(MessageConstants.LABORATORY_RESULT_NOT_FOUND);
            return MapToDto(entity);
        }

        public async Task<List<LaboratoryResultResponseDTO>> GetListByExaminationId(string examinationResultId)
        {
            var list = await _resultRepo.GetByExaminationResultIdAsync(examinationResultId);
            return list.Select(MapToDto).ToList();
        }

        public async Task<LaboratoryResultResponseDTO> UpdateById(string id, LaboratoryResultRequestDTO request)
        {
            var result = await _resultRepo.GetByIdAsync(id)
                ?? throw new ResourceNotFoundException(MessageConstants.LABORATORY_RESULT_NOT_FOUND);

            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == result.AssignmentId);

            if (assignment.Status == AssignmentStatus.COMPLETED
                 || assignment.Status == AssignmentStatus.COMPLETED)
            {
                throw new Exceptions.ArgumentException(MessageConstants.LABORATORY_RESULT_INVALID_UPDATE);
            }

            var technician = await _authService.GetAuthenticatedUser(); // [AUDIT]
            var oldData = await GetById(id); // [AUDIT]

            result.Note = request.Note;
            result.UpdatedAt = DateTime.UtcNow;
            using var transaction = await _context.Database.BeginTransactionAsync(); // [AUDIT]
            try
            {
                await _resultRepo.UpdateAsync(result);
                await _context.SaveChangesAsync();

                var newData = await GetById(id); // [AUDIT]
                await _logRepository.LogAsync(technician.Id, "UPDATE", "LaboratoryResults", result.Id, oldData, newData); // [AUDIT]

                await transaction.CommitAsync(); // [AUDIT]
                return newData;
            }
            catch
            {
                await transaction.RollbackAsync(); // [AUDIT]
                throw;
            }
        }

        public async Task<List<LaboratoryFilesResponseDTO>> UploadFiles(string laboratoryResultId, List<IFormFile> files)
        {
            var result = await _resultRepo.GetByIdAsync(laboratoryResultId)
                ?? throw new ResourceNotFoundException(MessageConstants.LABORATORY_RESULT_NOT_FOUND);

            var backendUrl = _configuration["App:BackendUrl"]?.TrimEnd('/');
            var responseList = new List<LaboratoryFilesResponseDTO>();

            foreach (var file in files)
            {
                var url = await _fileService.SaveFileAsync(file, "laboratory/");
                var labFile = new LaboratoryFile
                {
                    Id = Guid.NewGuid().ToString(),
                    LaboratoryResultId = laboratoryResultId,
                    Url = url
                };
                await _fileRepo.AddAsync(labFile);

                responseList.Add(new LaboratoryFilesResponseDTO
                {
                    Id = labFile.Id,
                    LaboratoryResultId = laboratoryResultId,
                    Url = $"{backendUrl}/uploads/{url.TrimStart('/')}"
                });
            }

            return responseList;
        }


        public async Task DeleteFileById(string fileId)
        {
            var file = await _fileRepo.GetByIdAsync(fileId)
                ?? throw new ResourceNotFoundException(MessageConstants.NOT_FOUND);

            await _fileService.DeleteFileAsync(file.Url);
            await _fileRepo.DeleteAsync(fileId);
        }

        private LaboratoryResultResponseDTO MapToDto(LaboratoryResult entity)
        {
            var backendUrl = _configuration["App:BackendUrl"]?.TrimEnd('/');
            return new LaboratoryResultResponseDTO
            {
                Id = entity.Id,
                AssignmentId = entity.AssignmentId,
                TechnicianId = entity.TechnicianId,
                TechnicianName = entity.Technician?.Name ?? "",
                ExaminationResultId = entity.ExaminationResultId,
                Note = entity.Note ?? "",
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                Files = entity.LaboratoryFiles?.Select(f => new LaboratoryFilesResponseDTO
                {
                    Id = f.Id,
                    LaboratoryResultId = f.LaboratoryResultId,
                    Url = $"{backendUrl}/uploads/{f.Url.TrimStart('/')}"
                }).ToList() ?? new()
            };
        }
    }

}
