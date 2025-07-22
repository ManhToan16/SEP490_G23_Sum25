namespace SEP490_BE.DTO.PrescriptionDTO
{
    public class PrescriptionResponseDTO
    {
        public string Id { get; set; }
        public string ExaminationResultId { get; set; }
        public string Note { get; set; }
        public List<PrescriptionItemResponseDTO> Items { get; set; }
    }

    public class PrescriptionItemResponseDTO
    {
        public string Id { get; set; }
        public string PrescriptionId { get; set; }
        public string MedicineId { get; set; }
        public string MedicineName { get; set; }
        public string Dosage { get; set; }
        public string Frequency { get; set; }
        public string Duration { get; set; }
        public string Instructions { get; set; }

    }

}
