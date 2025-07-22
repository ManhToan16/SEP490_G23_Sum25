namespace SEP490_BE.DTO.PrescriptionDTO
{
    public class PrescriptionRequestDTO
    {
        public string Note { get; set; }
        public List<PrescriptionItemRequestDTO> Items { get; set; }
    }
    
    public class PrescriptionItemRequestDTO
    {
        public string MedicineId { get; set; }
        public string Dosage { get; set; }
        public string Frequency { get; set; }
        public string Duration { get; set; }
        public string Instructions { get; set; }

    }
}
