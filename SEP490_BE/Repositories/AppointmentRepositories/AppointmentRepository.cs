using Microsoft.EntityFrameworkCore;
using SEP490_BE.DTO.AppointmentDTO;
using SEP490_BE.Entities;

namespace SEP490_BE.Repositories.AppointmentRepositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly KhanhAnNeurologyClinicContext _context;

        public AppointmentRepository(KhanhAnNeurologyClinicContext context)
        {
            _context = context;
        }
        public async Task<(List<AppointmentResponseDTO> appointments, int totalItems)> FindAll(
                string? name, string? email, string? phoneNumber, DateTime? dob, DateTime? date, string? status,
                int pageNumber, int pageSize)
        {
            var query = _context.Appointments.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(a => a.Name.Contains(name));
            }
            if (!string.IsNullOrWhiteSpace(email))
            {
                query = query.Where(a => a.Email.Contains(email));
            }
            if (!string.IsNullOrWhiteSpace(phoneNumber))
            {
                query = query.Where(a => a.PhoneNumber.Contains(phoneNumber));
            }
            if (dob.HasValue)
            {
                query = query.Where(a => a.DateOfBirth.Date == dob.Value.Date);
            }
            if (date.HasValue)
            {
                query = query.Where(a => a.Date.Date == date.Value.Date);
            }
            var totalItems = await query.CountAsync();

            var appointments = await query
                .OrderByDescending(a => a.Date)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AppointmentResponseDTO
                {
                    Id = a.Id,
                    Name = a.Name,
                    PhoneNumber = a.PhoneNumber,
                    Email = a.Email,
                    DateOfBirth = a.DateOfBirth,
                    Gender = a.Gender,
                    Address = a.Address ?? "",
                    Symptom = a.Symptom ?? "",
                    RequiredDoctorId = a.RequiredDoctorId ?? "",
                    RequiredDoctorName = a.RequiredDoctor.Name ?? "",
                    Date = a.Date,
                    TimeSlotId = a.TimeSlotId,
                    TimeSlotStartTime = a.TimeSlot.StartTime,
                    TimeSlotEndTime = a.TimeSlot.EndTime,
                    Status = a.Status,
                    TotalPrice = a.TotalPrice,
                    ExpiredAt = a.ExpiredAt,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();
            return (appointments, totalItems);
        }

        public async Task<Appointment> FindById(string id)
        {
            return await _context.Appointments
                .Include(a => a.RequiredDoctor) 
                .Include(a => a.TimeSlot)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task Insert(Appointment appointment) => await _context.Appointments.AddAsync(appointment);
        public async Task Update(Appointment appointment) => _context.Appointments.Update(appointment);
    }
}
