namespace SEP490_BE.DTO.ExaminationResultDTO
{
    public class ExaminationResultResponseDTO
    {
        public string Id { get; set; }
        public string MedicalRecordId { get; set; }
        public string DoctorId { get; set; }
        public string DoctorName { get; set; }
        public string VisitId { get; set; }
        public string PatientName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string AccessCode { get; set; }
        public string Summary { get; set; }
        public string Conclusion { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }


    }
}
