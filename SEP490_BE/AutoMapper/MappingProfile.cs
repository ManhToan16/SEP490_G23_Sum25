using AutoMapper;
using SEP490_BE.DTO;
using SEP490_BE.Models;

namespace SEP490_BE.AutoMapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<DoctorProfile, DoctorProfileDTO>().ReverseMap();
        }
    }
}
