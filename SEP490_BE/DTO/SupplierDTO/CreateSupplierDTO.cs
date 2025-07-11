namespace SEP490_BE.DTO.SupplierDTO
{
    public class CreateSupplierDTO
    {
        public string Name { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
    }
}
