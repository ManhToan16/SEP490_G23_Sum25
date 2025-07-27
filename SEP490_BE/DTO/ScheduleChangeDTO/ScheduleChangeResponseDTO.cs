namespace SEP490_BE.DTO.ScheduleChangeDTO
{
    public class ScheduleChangeResponseDTO
    {
        public string Id { get; set; }
        public string RequesterId { get; set; }
        public string RequesterScheduleId { get; set; }
        public string TargetUserId { get; set; }
        public string TargetScheduleId { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string? RequesterName { get; set; }
        public DateTime RequesterDate { get; set; }
        public string RequesterTimeSlotId { get; set; }
        public string? TargetUserName { get; set; }
        public DateTime TargetDate { get; set; }
        public string TargetTimeSlotId { get; set; }
    }
}
