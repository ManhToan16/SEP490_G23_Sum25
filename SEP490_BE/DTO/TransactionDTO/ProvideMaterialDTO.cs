using System.ComponentModel.DataAnnotations;

namespace SEP490_BE.DTO.TransactionDTO
{
    public class ProvideMaterialDTO
    {
        [Required(ErrorMessage = "Danh sách giao dịch không được để trống.")]
        [MinLength(1, ErrorMessage = "Phải có ít nhất một giao dịch.")]
        public List<TransactionProvideItemDTO> Transactions { get; set; } = new();
    }
    public class TransactionProvideItemDTO
    {
        [Required(ErrorMessage = "TransactionId không được để trống.")]
        public string TransactionId { get; set; } = null!; // lô nhập (IMPORT) gốc

        [Required(ErrorMessage = "Danh sách phân phát không được để trống.")]
        [MinLength(1, ErrorMessage = "Phải có ít nhất một phòng để phân phát.")]
        public List<ProvideRoomItemDTO> Rooms { get; set; } = new();
    }

}
