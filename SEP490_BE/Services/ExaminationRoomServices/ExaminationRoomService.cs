using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO.ExaminationRoomDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.ExaminationRoomRepositories;
using SEP490_BE.Repositories.ScheduleRepositories;
using SEP490_BE.Repositories.TransactionRepositories;

namespace SEP490_BE.Services.ExaminationRoomServices
{
    public class ExaminationRoomService : IExaminationRoomService
    {
        private readonly KhanhAnNeurologyClinicContext _context;
        private readonly IExaminationRoomRepository _examinationRoomRepository;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly ITransactionRepository _transactionRepository;


        public ExaminationRoomService(
            KhanhAnNeurologyClinicContext context,
            IExaminationRoomRepository examinationRoomRepository,
            IScheduleRepository scheduleRepository,ITransactionRepository transactionRepository)
        {
            _context = context;
            _examinationRoomRepository = examinationRoomRepository;
            _scheduleRepository = scheduleRepository;
            _transactionRepository = transactionRepository;
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
                    Description = er.Description,
                    IsActive = er.IsActive,
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
                Description = room.Description,
                IsActive = room.IsActive,

            };
        }

        public async Task<ExaminationRoomResponseDTO> Create(CreateExaminationRoomDTO request)
        {
            if (await _examinationRoomRepository.ExistsByNameAsync(request.Name))
            {
                throw new InvalidOperationException("Tên phòng đã tồn tại");
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
                Description = room.Description,
                IsActive = room.IsActive,

            };
        }
        public async Task<bool> IsExaminationRoomExistsAsync(string name)
        {
            return await _context.ExaminationRooms
                .AnyAsync(r => r.Name.ToLower().Trim() == name.ToLower().Trim());
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
            bool isNameChanged = request.Name != null && request.Name != room.Name;
            if (isNameChanged)
            {
                if (await _examinationRoomRepository.ExistsByNameAsync(request.Name))
                {
                    throw new InvalidOperationException("Tên phòng đã tồn tại.");
                }
            }


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
                Description = room.Description,
                IsActive = room.IsActive,
            };
        }

        public async Task Delete(string id)
        {
            var room = await _examinationRoomRepository.FindByIdAsync(id);
            if (room == null)
            {
                throw new ResourceNotFoundException("Không tìm thấy phòng khám lâm sàng.");
            }

            var hasSchedule = await _scheduleRepository.AnyScheduleUsingRoomAsync(id, "EXAMINATION");

            bool hasMaterial = await _transactionRepository.AnyTransactionUsingRoomAsync(id, "EXAMINATION");


            if (hasSchedule || hasMaterial)
            {
                throw new DbUpdateException("Phòng đang được sử dụng. Bạn có chắc chắn muốn xoá không?");
            }

            try
            {
                await _examinationRoomRepository.DeleteAsync(room);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new Exception("Lỗi khi xoá phòng khám: " + ex.InnerException?.Message, ex);
            }

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
            if (time < TimeSpan.Zero || time >= TimeSpan.FromHours(24))
            {
                throw new Exceptions.ArgumentOutOfRangeException("Thời gian phải nằm trong khoảng từ 00:00:00 đến 23:59:59.");
            }
            var rooms = await _examinationRoomRepository.GetActiveRoomsAsync();
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

                dto.PatientCount = await _context.Visits
                        .CountAsync(v => v.ExaminationRoomId == room.Id &&
                                   (v.Status == VisitStatus.WAITING || v.Status == VisitStatus.IN_EXAMINATION));
                result.Add(dto);
            }

            return result;
        }
        public async Task ActiveExaminationRoom(string id)
        {
            var room = await _examinationRoomRepository.FindByIdAsync(id)
                      ?? throw new ResourceNotFoundException("Không tìm thấy phòng khám");
            room.IsActive = true;
            await _examinationRoomRepository.UpdateAsync(room);
        }

        public async Task InactiveExaminationRoom(string id)
        {
            var room = await _examinationRoomRepository.FindByIdAsync(id)
                      ?? throw new ResourceNotFoundException("Không tìm thấy phòng khám");
            room.IsActive = false;
            await _examinationRoomRepository.UpdateAsync(room);

        }
        public async Task<List<ExaminationRoomResponseDTO>> GetActiveExaminationRoomsAsync()
        {
            var rooms = await _examinationRoomRepository.GetActiveRoomsAsync();

            var result = rooms.Select(r => new ExaminationRoomResponseDTO
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                IsActive = r.IsActive
            }).ToList();

            return result;
        }



    }
}
