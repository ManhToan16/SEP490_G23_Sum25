using Microsoft.EntityFrameworkCore;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.ExaminationRoomRepositories
{
    public class ExaminationRoomRepository : IExaminationRoomRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public ExaminationRoomRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }

        public async Task<ExaminationRoom> FindByIdAsync(string id)
        {
            return await _context.ExaminationRooms
                .Include(er => er.Visits)
                .FirstOrDefaultAsync(er => er.Id == id);
        }
        public async Task<bool> ExistsByNameAsync(string name)
        {
            return await _context.ExaminationRooms.AnyAsync(x => x.Name == name);
        }

        public async Task<(List<ExaminationRoom> Rooms, int TotalItems)> FindAll(
            string? name,
            string? description,
            int pageNumber,
            int pageSize)
        {
            var query = _context.ExaminationRooms
                .Include(er => er.Visits)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(er => er.Name.Contains(name));
            }
            if (!string.IsNullOrWhiteSpace(description))
            {
                query = query.Where(er => er.Description.Contains(description));
            }

            var totalItems = await query.CountAsync();
            var rooms = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (rooms, totalItems);
        }

        public async Task InsertAsync(ExaminationRoom room)
        {
            await _context.ExaminationRooms.AddAsync(room);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ExaminationRoom room)
        {
            _context.ExaminationRooms.Update(room);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(ExaminationRoom room)
        {
            _context.ExaminationRooms.Remove(room);
            await _context.SaveChangesAsync();
        }

        public async Task<(List<Visit> Queues, DoctorProfile Doctor)> GetPatientsAndDoctorInRoomAsync(string roomId, DateTime date)
        {
            var query = _context.Visits
                .Include(q => q.Appointment)
                .Where(q => q.ExaminationRoomId == roomId && q.CreateAt == date.Date)
                .AsQueryable();

            var doctorQuery = _context.DoctorProfiles
                .Include(dp => dp.Doctor)
                .Where(dp => dp.Doctor.UserRoles.Any(ur => ur.RoleName == "DOCTOR"));

            var doctor = await doctorQuery.FirstOrDefaultAsync();

            var queues = await query.ToListAsync();

            return (queues, doctor);
        }

        public async Task<List<Schedule>> GetSchedulesByRoomAndDateAsync(string roomId, DateTime date)
        {
            return await _context.Schedules
                .Include(s => s.User)
                .Where(s => s.RoomId == roomId  && s.Date == date.Date)
                .ToListAsync();
        }
    }
}
