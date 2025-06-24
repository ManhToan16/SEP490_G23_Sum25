using AutoMapper;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.Entities;


namespace SEP490_BE.AutoMapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<DoctorProfile, DoctorProfileResponseDTO>().ReverseMap();
        }
    }
}
