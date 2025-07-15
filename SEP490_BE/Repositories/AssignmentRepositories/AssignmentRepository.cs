using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO.AssignmentDTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.AssignmentRepositories
{
    public class AssignmentRepository : IAssignmentRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public AssignmentRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task Insert(Assignment assignment)
        {
            await _context.Assignments.AddAsync(assignment);
        }

        public async Task Update(Assignment assignment)
        {
            _context.Assignments.Update(assignment);
        }

        public async Task<Assignment?> FindById(string id)
        {
            return await _context.Assignments
                .Include(a => a.AssignmentServices)
                    .ThenInclude(asv => asv.Service)
                .Include(a => a.LaboratoryRoom)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<List<Assignment>> GetByVisitId(string visitId)
        {
            return await _context.Assignments
                .Include(a => a.AssignmentServices)
                    .ThenInclude(asv => asv.Service)
                .Include(a => a.LaboratoryRoom)
                .Where(a => a.VisitId == visitId)
                .ToListAsync();
        }

        public async Task<(List<AssignmentResponseDTO> Assignments, int TotalItems)> GetAssignments(
            string laboratoryRoomId,
            string? status,
            DateTime date,
            int pageNumber,
            int pageSize)
        {
            var query = _context.Assignments
                .Include(a => a.LaboratoryRoom)
                .Include(a => a.AssignmentServices)
                    .ThenInclude(asv => asv.Service)
                .Where(a => a.LaboratoryRoomId == laboratoryRoomId &&
                            a.CreateAt.HasValue && a.CreateAt.Value.Date == date.Date);

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(a => a.Status == status);
            }

            var totalItems = await query.CountAsync();

            var sortedAssignments = query
                .AsEnumerable()
                .OrderBy(a => a.Status switch
                {

                    AssignmentStatus.IN_PROGRESS => 1,
                    AssignmentStatus.WAITING => 2,
                    AssignmentStatus.PENDING => 3,
                    AssignmentStatus.COMPLETED => 4,
                    _ => 99
                })
                .ThenBy(a => a.CreateAt);

            var pagedAssignments = sortedAssignments
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AssignmentResponseDTO
                {
                    AssignmentId = a.Id,
                    VisitId = a.VisitId,
                    LaboratoryRoomId = a.LaboratoryRoomId,
                    LaboratoryRoomName = a.LaboratoryRoom.Name,
                    TotalPrice = a.TotalPrice ?? 0,
                    Status = a.Status,
                    AssignmentServices = a.AssignmentServices.Select(asv => new AssignmentServiceResponseDTO
                    {
                        ServiceId = asv.ServiceId,
                        ServiceName = asv.Service.Name,
                        Price = asv.Service.Price,
                    }).ToList()
                }).ToList();

            return (pagedAssignments, totalItems);
        }
    }
}
