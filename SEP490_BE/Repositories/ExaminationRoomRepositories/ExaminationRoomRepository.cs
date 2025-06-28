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
                .Include(er => er.DoctorSchedules)
                .Include(er => er.Queues)
                .ThenInclude(q => q.Appointment)
                .FirstOrDefaultAsync(er => er.Id == id);
        }

        public async Task<(List<ExaminationRoom> Rooms, int TotalItems)> FindAll(
            string? name,
            string? description,
            int pageNumber,
            int pageSize)
        {
            var query = _context.ExaminationRooms
                 .Include(er => er.DoctorSchedules) 
                 .Include(er => er.Queues)
                 .ThenInclude(q => q.Appointment)
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
       

        public async Task<DoctorProfile> GetDoctorInRoomAsync(string roomId, DateTime date)
        {
            var room = await _context.ExaminationRooms
                .Include(er => er.DoctorSchedules)
                .FirstOrDefaultAsync(er => er.Id == roomId);

            if (room == null)
            {
                return null;
            }

            var doctorSchedule = room.DoctorSchedules
                .Where(ds => ds.Date.Date == date.Date)
                .OrderBy(ds => ds.StartTime)
                .FirstOrDefault();

            if (doctorSchedule == null)
            {
                return null;
            }

            return await _context.DoctorProfiles
                .Include(dp => dp.Doctor)
                .FirstOrDefaultAsync(dp => dp.DoctorId == doctorSchedule.DoctorId);
        }
      
    }
}
