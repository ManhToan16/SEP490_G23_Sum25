namespace SEP490_BE.DTO.MedicalRecordDTO
{
    public class MedicalRecordRequestDTO
    {
        public string MedicalHistory { get; set; }
        public string Allergies { get; set; }
        public string SurgicalHistory { get; set; }
        public string Treatment { get; set; }
        public string CurrentMedications { get; set; }
    }
}
