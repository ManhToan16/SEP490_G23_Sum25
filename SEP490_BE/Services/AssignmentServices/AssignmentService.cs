using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO.AssignmentDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.AppointmentRepositories;
using SEP490_BE.Repositories.AssignmentRepositories;
using SEP490_BE.Repositories.LaboratoryRoomRepositories;
using SEP490_BE.Repositories.ServiceRepositories;
using SEP490_BE.Repositories.VisitRepositories;

namespace SEP490_BE.Services.AssignmentServices
{
    public class AssignmentService : IAssignmentService
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly ILaboratoryRoomRepository _laboratoryRoomRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IAppointmentRepository _appointmentRepository;

        public AssignmentService(
            IAssignmentRepository assignmentRepository,
            ILaboratoryRoomRepository laboratoryRoomRepository,
            IVisitRepository visitRepository,
            IServiceRepository serviceRepository,
            IAppointmentRepository appointmentRepository,
            KhanhAnNeurologyClinicContext context)
        {
            _assignmentRepository = assignmentRepository;
            _laboratoryRoomRepository = laboratoryRoomRepository;
            _visitRepository = visitRepository;
            _serviceRepository = serviceRepository;
            _appointmentRepository = appointmentRepository;
            _context = context;
        }

        public async Task<(List<AssignmentResponseDTO> Assignments, int TotalItems)> GetAssignments(string laboratoryRoomId, string? status, DateTime date, int pageNumber, int pageSize)
        {
            return await _assignmentRepository.GetAssignments(laboratoryRoomId, status, date, pageNumber, pageSize);
        }

        public async Task<AssignmentResponseDTO> GetById(string id)
        {
            var assignment = await _assignmentRepository.FindById(id);
            if (assignment == null)
                throw new ResourceNotFoundException("Assignment not found");

            return new AssignmentResponseDTO
            {
                AssignmentId = assignment.Id,
                VisitId = assignment.VisitId,
                LaboratoryRoomId = assignment.LaboratoryRoomId,
                LaboratoryRoomName = assignment.LaboratoryRoom?.Name ?? "",
                TotalPrice = assignment.TotalPrice,
                AssignmentServices = assignment.AssignmentServices.Select(s => new AssignmentServiceResponseDTO
                {
                    ServiceId = s.Service.Id,
                    ServiceName = s.Service.Name,
                    Price = s.Service.Price
                }).ToList()
            };
        }

        public async Task<List<AssignmentResponseDTO>> CreateRange(List<AssignmentRequestDTO> requests)
        {
            var results = new List<AssignmentResponseDTO>();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var request in requests)
                {
                    var visit = await _visitRepository.FindById(request.VisitId)
                        ?? throw new ResourceNotFoundException("Visit not found");
                    var labRoom = await _laboratoryRoomRepository.FindByIdAsync(request.LaboratoryRoomId)
                        ?? throw new ResourceNotFoundException("Laboratory room not found");
                    var services = await _context.Services
                        .Where(s => request.ServiceIds.Contains(s.Id))
                        .ToListAsync();
                    if (services.Count != request.ServiceIds.Count)
                        throw new Exceptions.ArgumentException("One or more service IDs are invalid.");
                    var totalPrice = CalculateTotalPrice(services);
                    var assignment = new Assignment
                    {
                        Id = Guid.NewGuid().ToString(),
                        LaboratoryRoomId = request.LaboratoryRoomId,
                        VisitId = request.VisitId,
                        TotalPrice = totalPrice,
                        Status = AssignmentStatus.PENDING,
                        CreateAt = DateTime.UtcNow
                    };
                    await _context.Assignments.AddAsync(assignment);
                    foreach (var service in services)
                    {
                        var assignmentService = new Entities.AssignmentService
                        {
                            AssignmentId = assignment.Id,
                            ServiceId = service.Id
                        };
                        await _context.AssignmentServices.AddAsync(assignmentService);
                    }

                    results.Add(new AssignmentResponseDTO
                    {
                        AssignmentId = assignment.Id,
                        VisitId = assignment.VisitId,
                        LaboratoryRoomId = assignment.LaboratoryRoomId,
                        LaboratoryRoomName = labRoom.Name,
                        TotalPrice = assignment.TotalPrice,
                        AssignmentServices = services.Select(s => new AssignmentServiceResponseDTO
                        {
                            ServiceId = s.Id,
                            ServiceName = s.Name,
                            Price = s.Price
                        }).ToList()
                    });
                }

                #region Update Visit
                var visitId = requests.First().VisitId;
                var visitToUpdate = await _context.Visits
                    .Include(v => v.Appointment)
                    .FirstOrDefaultAsync(v => v.Id == visitId)
                    ?? throw new ResourceNotFoundException("Visit not found");

                visitToUpdate.Status = VisitStatus.PENDING;
                #endregion

                #region Update Appointment
                // Tính tổng các assignment thuộc visit
                var totalAssignmentsPrice = await _context.Assignments
                    .Where(a => a.VisitId == visitId)
                    .SumAsync(a => a.TotalPrice ?? 0);

                visitToUpdate.Appointment.TotalPrice = (visitToUpdate.TotalPrice ?? 0) + totalAssignmentsPrice;
                visitToUpdate.Appointment.Status = AppointmentStatus.PENDING;
                #endregion

                await _visitRepository.Update(visitToUpdate);
                await _appointmentRepository.Update(visitToUpdate.Appointment);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return results;
        }

        public async Task<List<AssignmentResponseDTO>> GetByVisitId(string visitId)
        {
            var assignments = await _assignmentRepository.GetByVisitId(visitId);

            return assignments.Select(a => new AssignmentResponseDTO
            {
                AssignmentId = a.Id,
                VisitId = a.VisitId,
                LaboratoryRoomId = a.LaboratoryRoomId,
                LaboratoryRoomName = a.LaboratoryRoom?.Name ?? "",
                TotalPrice = a.TotalPrice,
                AssignmentServices = a.AssignmentServices.Select(s => new AssignmentServiceResponseDTO
                {
                    ServiceId = s.Service.Id,
                    ServiceName = s.Service.Name,
                    Price = s.Service.Price
                }).ToList()
            }).ToList();
        }

        public async Task UpdateStatus(string id, string status)
        {
            var assignment = await _assignmentRepository.FindById(id) ??
                throw new ResourceNotFoundException("Assignment not found");

            assignment.Status = status;
            await _assignmentRepository.Update(assignment);
            await _context.SaveChangesAsync();
        }

        public async Task Calling(string id)
        {
            var assignment = await _assignmentRepository.FindById(id) ??
                throw new ResourceNotFoundException("Assignment not found");

            if (assignment.Status != AssignmentStatus.WAITING)
                throw new Exceptions.ArgumentException("Assignment must be in WAITING state to call.");

            assignment.Status = AssignmentStatus.IN_PROGRESS;
            await _assignmentRepository.Update(assignment);
            await _context.SaveChangesAsync();
        }

        public async Task MarkAsCompleted(string id)
        {
            var assignment = await _assignmentRepository.FindById(id)
                ?? throw new ResourceNotFoundException("Assignment not found");

            assignment.Status = AssignmentStatus.COMPLETED;

            var visit = await _visitRepository.FindById(assignment.VisitId)
                ?? throw new ResourceNotFoundException("Visit not found for this assignment");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _assignmentRepository.Update(assignment);
                await _context.SaveChangesAsync();

                // Kiểm tra tất cả các assignment khác của cùng visit đã hoàn tất chưa
                var allCompleted = await _context.Assignments
                    .Where(a => a.VisitId == visit.Id)
                    .AllAsync(a => a.Status == AssignmentStatus.COMPLETED);

                if (allCompleted)
                {
                    visit.Status = VisitStatus.RETURNING;
                    await _visitRepository.Update(visit);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private decimal CalculateTotalPrice(List<Service> services)
        {
            return (decimal) services.Sum(s => s.Price ?? 0); ;
        }
    }
}
