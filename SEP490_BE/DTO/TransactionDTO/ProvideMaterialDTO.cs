using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.TransactionDTO
{
    public class ProvideMaterialDTO
    {
        [Required(ErrorMessage = "MaterialId không được để trống.")]
        public string MaterialId { get; set; } = null!;

        [Required(ErrorMessage = "Quantity không được để trống.")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity phải lớn hơn 0.")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "RoomId không được để trống.")]
        public string RoomId { get; set; } = null!;
    }
}
