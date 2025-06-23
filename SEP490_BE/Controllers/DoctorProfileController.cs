
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;
using SEP490_BE.DTO;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Repositories.impl;
using SEP490_BE.Services.DoctorProfileServices;

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
            try
            {
                var dto = await _doctorProfileService.GetById(id);
                return Ok(new ApiResponse
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = MessageConstants.GET_SUCCESS,
                    Data = dto
                });
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(new ApiResponse
                {
                    StatusCode = StatusCodes.Status404NotFound,
                    Success = false,
                    Message = ex.Message,
                    Data = null
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateDoctorProfile([FromBody] CreateDoctorProfileDTO dto)
        {
            try
            {
                var createdDto = await _doctorProfileService.Create(dto);
                return Ok(new ApiResponse
                {
                    StatusCode = StatusCodes.Status201Created,
                    Success = true,
                    Message = MessageConstants.POST_SUCCESS,
                    Data = createdDto
                });
            }
            catch (ConflictDataException ex)
            {
                return Conflict(new ApiResponse
                {
                    StatusCode = StatusCodes.Status409Conflict,
                    Success = false,
                    Message = ex.Message,
                    Data = null
                });
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(new ApiResponse
                {
                    StatusCode = StatusCodes.Status404NotFound,
                    Success = false,
                    Message = ex.Message,
                    Data = null
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctorProfile(string id, [FromBody] UpdateDoctorProfileDTO dto)
        {
            try
            {
                var updatedDto = await _doctorProfileService.Update(id, dto);
                return Ok(new ApiResponse
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = MessageConstants.PUT_SUCCESS,
                    Data = updatedDto
                });
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(new ApiResponse
                {
                    StatusCode = StatusCodes.Status404NotFound,
                    Success = false,
                    Message = ex.Message,
                    Data = null
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctorProfile(string id)
        {
            try
            {
                await _doctorProfileService.Delete(id);
                return Ok(new ApiResponse
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = MessageConstants.DELETE_SUCCESS,
                    Data = null
                });
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(new ApiResponse
                {
                    StatusCode = StatusCodes.Status404NotFound,
                    Success = false,
                    Message = ex.Message,
                    Data = null
                });
            }
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
