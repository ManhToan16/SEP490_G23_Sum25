namespace SEP490_BE.DTO.AuthDTO
{
    public class TokenRequestDTO
    {
         public string AccessToken { get; set; }
         public string RefreshToken { get; set; }
         public string DeviceId { get; set; }

    }
}
