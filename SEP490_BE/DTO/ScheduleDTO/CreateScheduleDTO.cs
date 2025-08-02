using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.ScheduleDTO
{
    public class CreateScheduleDTO
    {
        [Required(ErrorMessage = "UserId không được để trống.")]
        public string UserId { get; set; } = null!;
        [Required(ErrorMessage = "RoomId không được để trống.")]
        public string RoomId { get; set; } = null!;
        [Required(ErrorMessage = "TimeSlotId không được để trống.")]
        public string TimeSlotId { get; set; } = null!;
        [Required(ErrorMessage = "Ngày không được để trống.")]
        [DataType(DataType.Date)]
        [CustomValidation(typeof(CreateScheduleDTO), nameof(ValidateDate))]
        public DateTime Date { get; set; }
        public static ValidationResult? ValidateDate(DateTime date, ValidationContext context)
        {
            if (date.Date < DateTime.Today)
            {
                return new ValidationResult("Không thể tạo lịch cho ngày trong quá khứ.");
            }
            return ValidationResult.Success;
        }
    }
}
