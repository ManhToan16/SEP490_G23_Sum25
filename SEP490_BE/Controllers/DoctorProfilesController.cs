using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.DoctorProfileServices;
using Microsoft.AspNetCore.Authorization;

namespace SEP490_BE.Controllers
{
    [Route("api/Doctor/Profiles")]
    [ApiController]
    public class DoctorProfilesController : ControllerBase
    {
        private readonly IDoctorProfileService _doctorProfileService;

        public DoctorProfilesController(IDoctorProfileService doctorProfileService)
        {
            _doctorProfileService = doctorProfileService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDoctorProfile(string id)
        {

            var dto = await _doctorProfileService.GetById(id);
            var data = dto != null ? new List<object> { dto } : new List<object>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = data
            });


        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPost]
        public async Task<IActionResult> CreateDoctorProfile([FromBody] CreateDoctorProfileDTO dto)
        {

            var createdDto = await _doctorProfileService.Create(dto);
            var data = createdDto != null ? new List<object> { createdDto } : new List<object>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = data
            });
        }
        [Authorize(Roles = RoleConstants.Admin + "," + RoleConstants.Doctor)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctorProfile(string id, [FromBody] UpdateDoctorProfileDTO dto)
        {

            var updatedDto = await _doctorProfileService.Update(id, dto);
            var data = updatedDto != null ? new List<object> { updatedDto } : new List<object>();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = data
            });

        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctorProfile(string id)
        {

            await _doctorProfileService.Delete(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = new List<object>()
            });

        }

        [HttpGet]
        public async Task<IActionResult> GetAllDoctorProfiles(
            [FromQuery] string? qualifications = null,
           [FromQuery] int? minYearsOfExperience = null,
           [FromQuery] int? maxYearsOfExperience = null,
          [FromQuery] int pageNumber = 1,
           [FromQuery] int pageSize = 10)
        {
            var pagination = await _doctorProfileService.GetAll(qualifications, minYearsOfExperience, maxYearsOfExperience, pageNumber, pageSize);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = pagination
            });
        }
    }
}
