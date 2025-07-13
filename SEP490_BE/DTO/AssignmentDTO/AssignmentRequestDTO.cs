using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.AssignmentDTO
{
    public class AssignmentRequestDTO
    {
        [Required]
        public string LaboratoryRoomId { get; set; }

        [Required]
        public string VisitId { get; set; }

        [Required]
        public List<string> ServiceIds { get; set; } = new List<string>();

    }
}
