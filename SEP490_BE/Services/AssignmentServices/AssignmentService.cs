using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.AssignmentDTO;
using SEP490_BE.DTO.VisitDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Hubs;
using SEP490_BE.Repositories.AppointmentRepositories;
using SEP490_BE.Repositories.AssignmentRepositories;
using SEP490_BE.Repositories.ExaminationResultRepositories;
using SEP490_BE.Repositories.LaboratoryResultRepositories;
using SEP490_BE.Repositories.LaboratoryRoomRepositories;
using SEP490_BE.Repositories.ServiceRepositories;
using SEP490_BE.Repositories.VisitRepositories;
using System.ComponentModel;

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
        private readonly ILaboratoryResultRepository _laboratoryResultRepository;
        private readonly IExaminationResultRepository _examinationResultRepository;
        private readonly IHubContext<KhanhAnHub> _hubContext;

        public AssignmentService(
            IAssignmentRepository assignmentRepository,
            ILaboratoryRoomRepository laboratoryRoomRepository,
            IVisitRepository visitRepository,
            IServiceRepository serviceRepository,
            IAppointmentRepository appointmentRepository,
            KhanhAnNeurologyClinicContext context,
            ILaboratoryResultRepository laboratoryResultRepository,
            IExaminationResultRepository examinationResultRepository,
            IHubContext<KhanhAnHub> hubContext
            )
        {
            _assignmentRepository = assignmentRepository;
            _laboratoryRoomRepository = laboratoryRoomRepository;
            _visitRepository = visitRepository;
            _serviceRepository = serviceRepository;
            _appointmentRepository = appointmentRepository;
            _context = context;
            _laboratoryResultRepository = laboratoryResultRepository;
            _examinationResultRepository = examinationResultRepository;
            _hubContext = hubContext;
        }

        public async Task<Pagination<AssignmentResponseDTO>> GetAssignments(string laboratoryRoomId, string? status, DateTime date, int pageNumber, int pageSize)
        {
            var (assignments, totalItems) = await _assignmentRepository.GetAssignments(laboratoryRoomId, status, date, pageNumber, pageSize);
            return new Pagination<AssignmentResponseDTO>
            {
                Items = assignments,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<AssignmentResponseDTO> GetById(string id)
        {
            var assignment = await _assignmentRepository.FindById(id);
            if (assignment == null)
                throw new ResourceNotFoundException(MessageConstants.ASSIGNMENT_NOT_FOUND);

            return new AssignmentResponseDTO
            {
                AssignmentId = assignment.Id,
                VisitId = assignment.VisitId,
                LaboratoryRoomId = assignment.LaboratoryRoomId,
                LaboratoryRoomName = assignment.LaboratoryRoom?.Name ?? "",
                TotalPrice = assignment.TotalPrice,
                Status = assignment.Status,
                AssignmentServices = assignment.AssignmentServices.Select(s => new AssignmentServiceResponseDTO
                {
                    ServiceId = s.Service.Id,
                    ServiceName = s.Service.Name,
                    Price = s.Service.Price
                }).ToList()
            };
        }

        public async Task<List<AssignmentResponseDTO>> CreateRange(string visitId, List<AssignmentRequestDTO> requests)
        {
            var results = new List<AssignmentResponseDTO>();

            var visit = await _visitRepository.FindById(visitId)
                ?? throw new ResourceNotFoundException(MessageConstants.VISIT_NOT_FOUND);
            var examResult = await _examinationResultRepository.FindByVisitIdAsync(visitId);
            if (examResult == null)
            {
                throw new Exceptions.ArgumentException("Lượt khám cần có phiếu khám tổng quát để tạo chỉ định");
            }

            var duplicateLabRooms = requests
                .GroupBy(r => r.LaboratoryRoomId)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();
            if (duplicateLabRooms.Any())
                throw new Exceptions.ArgumentException("Mỗi phòng xét nghiệm chỉ được tạo 1 chỉ định trong 1 lượt khám.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var createdAssignments = new List<Assignment>();
                foreach (var request in requests)
                {
                    var labRoom = await _laboratoryRoomRepository.FindByIdAsync(request.LaboratoryRoomId)
                        ?? throw new ResourceNotFoundException(MessageConstants.LABO_ROOM_NOT_FOUND);
                    var services = await _context.Services
                        .Where(s => request.ServiceIds.Contains(s.Id))
                        .ToListAsync();
                    if (services.Count != request.ServiceIds.Count)
                        throw new Exceptions.ArgumentException(MessageConstants.ASSIGNMENT_SERVICE_INVALID);

                    var invalidServices = services.Where(s => s.LaboratoryRoomsId != request.LaboratoryRoomId).ToList();
                    if (invalidServices.Any())
                    {
                        var invalidNames = string.Join(", ", invalidServices.Select(s => s.Name));
                        throw new Exceptions.ArgumentException($"Các dịch vụ này không thuộc phòng xét nghiệm '{labRoom.Name}': {invalidNames}");
                    }

                    var totalPrice = CalculateTotalPrice(services);
                    var assignment = new Assignment
                    {
                        Id = Guid.NewGuid().ToString(),
                        LaboratoryRoomId = request.LaboratoryRoomId,
                        VisitId = visitId,
                        TotalPrice = totalPrice,
                        Status = AssignmentStatus.PENDING,
                        CreateAt = DateTime.UtcNow
                    };
                    await _context.Assignments.AddAsync(assignment);
                    createdAssignments.Add(assignment);

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
                        Status = assignment.Status,
                        AssignmentServices = services.Select(s => new AssignmentServiceResponseDTO
                        {
                            ServiceId = s.Id,
                            ServiceName = s.Name,
                            Price = s.Price
                        }).ToList()
                    });
                }
                await _context.SaveChangesAsync();

                #region Update Visit
                var visitToUpdate = await _context.Visits
                    .Include(v => v.Appointment)
                    .FirstOrDefaultAsync(v => v.Id == visitId)
                    ?? throw new ResourceNotFoundException(MessageConstants.VISIT_NOT_FOUND);

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

                foreach (var asm in createdAssignments)
                {
                    await _hubContext.Clients.All.SendAsync("AssignmentChanged", new
                    {
                        Action = "CREATE",
                        AssignmentId = asm.Id,
                        LaboratoryRoomId = asm.LaboratoryRoomId,
                        Status = asm.Status
                    });
                }

                await _hubContext.Clients.All.SendAsync("AppointmentChanged", new
                {
                    Action = "UPDATE",
                    Id = visitToUpdate.Appointment.Id,
                    Email = visitToUpdate.Appointment.Email,
                    PhoneNumber = visitToUpdate.Appointment.PhoneNumber,
                    DateOfBirth = visitToUpdate.Appointment.DateOfBirth,
                    Date = visitToUpdate.Appointment.Date,
                    Status = visitToUpdate.Appointment.Status,
                });

                await _hubContext.Clients.All.SendAsync("VisitChanged", new
                {
                    Action = "UPDATE",
                    VisitId = visitToUpdate.Id,
                    ExaminationRoomId = visitToUpdate.ExaminationRoomId,
                    QueueNumber = visitToUpdate.QueueNumber,
                    Status = visitToUpdate.Status,
                    IsPrioritized = visitToUpdate.IsPrioritized,
                });
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
                Status = a.Status,
                AssignmentServices = a.AssignmentServices.Select(s => new AssignmentServiceResponseDTO
                {
                    ServiceId = s.Service.Id,
                    ServiceName = s.Service.Name,
                    Price = s.Service.Price
                }).ToList()
            }).ToList();
        }

        public async Task<AssignmentResponseDTO> Calling(string id)
        {
            var assignment = await _assignmentRepository.FindById(id) ??
                throw new ResourceNotFoundException(MessageConstants.ASSIGNMENT_NOT_FOUND);

            if (assignment.Status != AssignmentStatus.WAITING)
                throw new Exceptions.ArgumentException(MessageConstants.ASSIGNMENT_INVALID_CALLING);

            assignment.Status = AssignmentStatus.IN_PROGRESS;
            await _assignmentRepository.Update(assignment);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("AssignmentChanged", new
            {
                Action = "UPDATE",
                AssignmentId = assignment.Id,
                LaboratoryRoomId = assignment.LaboratoryRoomId,
                Status = assignment.Status
            });

            return new AssignmentResponseDTO
            {
                AssignmentId = assignment.Id,
                VisitId = assignment.VisitId,
                LaboratoryRoomId = assignment.LaboratoryRoomId,
                LaboratoryRoomName = assignment.LaboratoryRoom?.Name ?? "",
                TotalPrice = assignment.TotalPrice,
                Status = assignment.Status,
                AssignmentServices = assignment.AssignmentServices.Select(s => new AssignmentServiceResponseDTO
                {
                    ServiceId = s.Service.Id,
                    ServiceName = s.Service.Name,
                    Price = s.Service.Price
                }).ToList()
            };
        }

        public async Task<AssignmentResponseDTO> MarkAsCompleted(string id)
        {
            var assignment = await _assignmentRepository.FindById(id)
                ?? throw new ResourceNotFoundException(MessageConstants.ASSIGNMENT_NOT_FOUND);

            assignment.Status = AssignmentStatus.COMPLETED;

            var visit = await _visitRepository.FindById(assignment.VisitId)
                ?? throw new ResourceNotFoundException(MessageConstants.VISIT_NOT_FOUND);

            var laboResult = await _laboratoryResultRepository.GetByAssignmentIdAsync(assignment.Id);
            if (laboResult == null) {
                throw new Exceptions.ArgumentException("Chỉ định khi chưa có phiếu kết quả xét nghiệm");
            }

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

                await _hubContext.Clients.All.SendAsync("AssignmentChanged", new
                {
                    Action = "UPDATE",
                    AssignmentId = assignment.Id,
                    LaboratoryRoomId = assignment.LaboratoryRoomId,
                    Status = assignment.Status
                });

                await _hubContext.Clients.All.SendAsync("VisitChanged", new
                {
                    Action = "UPDATE",
                    VisitId = visit.Id,
                    ExaminationRoomId = visit.ExaminationRoomId,
                    QueueNumber = visit.QueueNumber,
                    Status = visit.Status,
                    IsPrioritized = visit.IsPrioritized,
                });

            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return new AssignmentResponseDTO
            {
                AssignmentId = assignment.Id,
                VisitId = assignment.VisitId,
                LaboratoryRoomId = assignment.LaboratoryRoomId,
                LaboratoryRoomName = assignment.LaboratoryRoom?.Name ?? "",
                TotalPrice = assignment.TotalPrice,
                Status = assignment.Status,
                AssignmentServices = assignment.AssignmentServices.Select(s => new AssignmentServiceResponseDTO
                {
                    ServiceId = s.Service.Id,
                    ServiceName = s.Service.Name,
                    Price = s.Service.Price
                }).ToList()
            };
        }

        private decimal CalculateTotalPrice(List<Service> services)
        {
            return (decimal) services.Sum(s => s.Price ?? 0); ;
        }
    }
}
