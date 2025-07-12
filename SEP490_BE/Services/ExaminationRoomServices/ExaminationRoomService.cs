using Microsoft.EntityFrameworkCore;
using SEP490_BE.DTO;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO.ExaminationRoomDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.ExaminationRoomRepositories;

namespace SEP490_BE.Services.ExaminationRoomServices
{
    public class ExaminationRoomService : IExaminationRoomService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IExaminationRoomRepository _examinationRoomRepository;

        public ExaminationRoomService(
            KhanhAnNeurologyClinicContext context,
            IExaminationRoomRepository examinationRoomRepository)
        {
            _context = context;
            _examinationRoomRepository = examinationRoomRepository;
        }

        public async Task<Pagination<ExaminationRoomResponseDTO>> GetAll(
            string? name,
            string? description,
            int pageNumber,
            int pageSize)
        {
            var (rooms, totalItems) = await _examinationRoomRepository.FindAll(name, description, pageNumber, pageSize);
            return new Pagination<ExaminationRoomResponseDTO>
            {
                Items = rooms.Select(er => new ExaminationRoomResponseDTO
                {
                    Id = er.Id,
                    Name = er.Name,
                    Description = er.Description
                }).ToList(),
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ExaminationRoomResponseDTO> GetById(string id)
        {
            var room = await _examinationRoomRepository.FindByIdAsync(id);
            if (room == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy phòng khám lâm sàng.");
            }
            return new ExaminationRoomResponseDTO
            {
                Id = room.Id,
                Name = room.Name,
                Description = room.Description
            };
        }

        public async Task<ExaminationRoomResponseDTO> Create(CreateExaminationRoomDTO request)
        {
            var existingRoom = await _examinationRoomRepository.FindByIdAsync(Guid.NewGuid().ToString());
            if (existingRoom != null)
            {
                throw new ConflictDataException("Phòng khám lâm sàng đã tồn tại");
            }

            var room = new ExaminationRoom
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Description = request.Description
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _examinationRoomRepository.InsertAsync(room);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new ExaminationRoomResponseDTO
            {
                Id = room.Id,
                Name = room.Name,
                Description = room.Description
            };
        }

        public async Task<ExaminationRoomResponseDTO> Update(string id, UpdateExaminationRoomDTO request)
        {
            var room = await _examinationRoomRepository.FindByIdAsync(id);
            if (room == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy phòng khám lâm sàng.");
            }

            room.Name = request.Name ?? room.Name;
            room.Description = request.Description ?? room.Description;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _examinationRoomRepository.UpdateAsync(room);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new ExaminationRoomResponseDTO
            {
                Id = room.Id,
                Name = room.Name,
                Description = room.Description
            };
        }

        public async Task Delete(string id)
        {
            var room = await _examinationRoomRepository.FindByIdAsync(id);
            if (room == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy phòng khám lâm sàng.");
            }

            await _examinationRoomRepository.DeleteAsync(room);
            await _context.SaveChangesAsync();
        }
        public async Task<List<PatientInRoomDTO>> GetPatientsInRoomAsync(string roomId)
        {
            var (queues, _) = await _examinationRoomRepository.GetPatientsAndDoctorInRoomAsync(roomId, DateTime.Today);
            if (queues == null || !queues.Any())
            {
                return new List<PatientInRoomDTO>();
            }

            return queues.Select(q => new PatientInRoomDTO
            {
                AppointmentId = q.AppointmentId,
                Name = q.Appointment.Name,
                PhoneNumber = q.Appointment.PhoneNumber,
                CreateAt = q.CreateAt
            }).ToList();
        }

        public async Task<(List<PatientInRoomDTO> Patients, DoctorProfileResponseDTO Doctor)> GetPatientsAndDoctorInRoomAsync(string roomId)
        {
            var (queues, doctor) = await _examinationRoomRepository.GetPatientsAndDoctorInRoomAsync(roomId, DateTime.Today);
            if (queues == null || !queues.Any())
            {
                return (new List<PatientInRoomDTO>(), null);
            }

            var patients = queues.Select(q => new PatientInRoomDTO
            {
                AppointmentId = q.AppointmentId,
                Name = q.Appointment.Name,
                PhoneNumber = q.Appointment.PhoneNumber,
                CreateAt = q.CreateAt
            }).ToList();

            DoctorProfileResponseDTO doctorDto = null;
            if (doctor != null)
            {
                doctorDto = new DoctorProfileResponseDTO
                {
                    Id = doctor.Id,
                    DoctorId = doctor.DoctorId,
                    Qualifications = doctor.Qualifications,
                    YearsOfExperience = doctor.YearsOfExperience,
                    Biography = doctor.Biography,
                    Avatar = doctor.Avatar,
                    Name = doctor.Doctor?.Name,
                    PhoneNumber = doctor.Doctor?.PhoneNumber,
                    Email = doctor.Doctor?.Email,
                    DateOfBirth = doctor.Doctor?.DateOfBirth
                };
            }

            return (patients, doctorDto);
        }

        public async Task<List<ExaminationRoomWithDoctorDTO>> GetExaminationRoomsByDate(
             TimeSpan time,
             DateTime date)
        {

            var rooms = await _examinationRoomRepository.FindAll(null, null, 1, int.MaxValue).ContinueWith(t => t.Result.Rooms);
            var result = new List<ExaminationRoomWithDoctorDTO>();

            foreach (var room in rooms)
            {
         
                var schedules = await _examinationRoomRepository.GetSchedulesByRoomAndDateAsync(room.Id, date);

                ExaminationRoomWithDoctorDTO dto = new ExaminationRoomWithDoctorDTO
                {
                    Room = new ExaminationRoomResponseDTO
                    {
                        Id = room.Id,
                        Name = room.Name ?? "Không biết phòng",
                        Description = room.Description ?? "Không có mô tả"
                    }
                };

              
       

                foreach (var s in schedules)
                {
                    var timeSlot = await _context.TimeSlots.FirstOrDefaultAsync(ts => ts.Id == s.TimeSlotId);
                    Console.WriteLine($"ScheduleId: {s.Id}, Role: {s.Role}, TimeSlotId: {s.TimeSlotId}, " +
    $"Slot: {timeSlot?.StartTime} - {timeSlot?.EndTime}, " +
    $"Condition: {timeSlot?.StartTime <= time && time < timeSlot?.EndTime}");
                    if (timeSlot != null &&
                        timeSlot.StartTime <= time &&
                        time < timeSlot.EndTime) 

                    {
                        var doctor = await _context.Users.FindAsync(s.UserId);
                        if (doctor != null)
                        {
                            dto.DoctorId = doctor.Id;
                            dto.DoctorName = doctor.Name;
                            break; 
                        }
                    }
                }


                result.Add(dto);
            }

            return result;
        }


    }
}
