using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO.VisitDTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.VisitRepositories
{
    public class VisitRepository : IVisitRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public VisitRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<List<Visit>> GetVisitsForCalling(string examinationRoomId, DateTime date)
        {
            var targetDate = date.Date;

            var visits = await _context.Visits
                .Include(v => v.PatientProfile)
                .Include(v => v.Appointment)
                .Include(v => v.AssignedDoctor)
                .Where(v => v.ExaminationRoomId == examinationRoomId
                         && v.CreateAt.HasValue && v.CreateAt.Value.Date == targetDate)
                .ToListAsync();

            var sortedVisits = visits.OrderBy(v => v.Status switch
            {
                VisitStatus.IN_EXAMINATION => 1,
                VisitStatus.RETURNING => 2,
                VisitStatus.WAITING when v.IsPrioritized == true => 3,
                VisitStatus.WAITING when v.IsPrioritized == false => 4,
                VisitStatus.IN_LABORATORY => 5,
                VisitStatus.COMPLETED => 6,
                _ => 99 // unknown
            })
            .ThenBy(v => v.QueueNumber)
            .ToList();
            return sortedVisits;
        }

        public async Task Insert(Visit visit)
        {
            await _context.Visits.AddAsync(visit);
        }

        public async Task Update(Visit visit)
        {
            _context.Visits.Update(visit);
            await Task.CompletedTask;
        }

        public async Task<Visit?> FindById(string id)
        {
            return await _context.Visits
                .Include(v => v.Appointment)
                .Include(v => v.AssignedDoctor)
                .Include(v => v.ExaminationRoom)
                .Include(v => v.PatientProfile)
                .FirstOrDefaultAsync(v => v.Id == id);
        }

        public async Task<(List<VisitResponseDTO> Visits, int TotalItems)> GetVisits(
                string examinationRoomId,
                string? status,
                DateTime date,
                int pageNumber,
                int pageSize)
        {
            var query = _context.Visits
                .Include(v => v.AssignedDoctor)
                .Include(v => v.Appointment)
                .Include(v => v.PatientProfile)
                .Include(v => v.ExaminationRoom)
                .AsQueryable();

            query = query.Where(v => v.ExaminationRoomId == examinationRoomId);

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(v => v.Status == status);
            }
             
            var targetDate = date.Date;
            query = query.Where(v => v.CreateAt.HasValue && v.CreateAt.Value.Date == targetDate);
            
            var totalItems = await query.CountAsync();
            var visitEntities = await query.ToListAsync();

            var sortedVisits = visitEntities
                .OrderBy(v => v.Status switch
                {
                    VisitStatus.IN_EXAMINATION => 1,
                    VisitStatus.RETURNING => 2,
                    VisitStatus.WAITING when v.IsPrioritized == true => 3,
                    VisitStatus.WAITING when v.IsPrioritized == false => 4,
                    VisitStatus.IN_LABORATORY => 5,
                    VisitStatus.COMPLETED => 6,
                    _ => 99
                })
                .ThenBy(v => v.QueueNumber)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new VisitResponseDTO
                {
                    ExaminationRoomId = v.ExaminationRoomId,
                    AppointmentId = v.AppointmentId,
                    AssignedDoctortId = v.AssignedDoctorId,
                    PatientProfileId = v.PatientProfileId,
                    PatientName = v.PatientName,
                    QueueNumber = v.QueueNumber,
                    TotalPrice = v.TotalPrice ?? 0,
                    Status = v.Status ?? "",
                    IsPrioritized = v.IsPrioritized ?? false
                })
                .ToList();

            return (sortedVisits, totalItems);
        }

    }
}