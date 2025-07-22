namespace SEP490_BE.DTO.LaboratoryResultDTO
{
    public class LaboratoryResultResponseDTO
    {
        public string Id { get; set; }
        public string ExaminationResultId { get; set; }
        public string AssignmentId { get; set; }
        public string TechnicianId { get; set; }
        public string TechnicianName { get; set; }
        public string Note { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public List<LaboratoryFilesResponseDTO> Files { get; set; }

    }

    public class LaboratoryFilesResponseDTO
    {
        public string Id { get; set; }
        public string LaboratoryResultId { get; set; }
        public string Url { get; set; }
    }
}
