namespace SEP490_BE.Constants
{
    public class AppointmentStatus
    {
        public const string WAITING_FOR_CONFIRMATION = "WAITING_FOR_CONFIRMATION";
        public const string WAITING_FOR_CHECK_IN = "WAITING_FOR_CHECK_IN";
        public const string CHECKED_IN = "CHECKED_IN";
        public const string IN_EXAMINATION_PROGRESS = "IN_EXAMINATION_PROGRESS";
        public const string PENDING = "PENDING";
        public const string IN_LABORATORY_PROGRESS = "IN_LABORATORY_PROGRESS";
        public const string COMPLETED = "COMPLETED";
        public const string CANCELLED = "CANCELLED";
        public const string PENDING_WITHOUT_ASSIGNMENT = "PENDING_WITHOUT_ASSIGNMENT";
    }
}
