namespace SEP490_BE.DTO.ScheduleDTO
{
    public class ScheduleStatisticsDTO
    {
        public string Role { get; set; }
        public int TotalDoctors { get; set; }
        public int TotalRooms { get; set; }
        public int TotalShifts { get; set; }
        public double ShiftsPerDay { get; set; }
    }
}
