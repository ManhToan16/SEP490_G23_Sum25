namespace SEP490_BE.DTO.ScheduleChangeDTO
{
    public class CreateScheduleChangeDTO
    {
        public string RequesterScheduleId { get; set; } = null!;
        public string TargetUserId { get; set; } = null!;
        public string TargetScheduleId { get; set; } = null!;
        public string Reason { get; set; } = null!;
    }
}
