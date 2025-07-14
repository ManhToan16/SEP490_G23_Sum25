using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.AssignmentDTO
{
    public class AssignmentResponseDTO
    {
        public string AssignmentId { get; set; }
        public string VisitId { get; set; }
        public string LaboratoryRoomId { get; set; }
        public string LaboratoryRoomName { get; set; }
        public decimal? TotalPrice { get; set; }
        public string Status { get; set; }
        public List<AssignmentServiceResponseDTO> AssignmentServices { get; set; }
    }

    public class AssignmentServiceResponseDTO
    {
        public string ServiceId { get; set; }
        public string ServiceName { get; set; }
        public decimal? Price { get; set; }
    }
}
