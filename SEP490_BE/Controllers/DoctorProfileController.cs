using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.DTO;
using SEP490_BE.Models;
using SEP490_BE.Repositories.impl;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorProfilesController : ControllerBase
    {
        private readonly IDoctorProfileRepository _doctorProfileService;
        private readonly IMapper _mapper;

        public DoctorProfilesController(IDoctorProfileRepository doctorProfileService, IMapper mapper)
        {
            _doctorProfileService = doctorProfileService;
            _mapper = mapper;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllDoctorProfiles()
        {
            var doctorProfiles = await _doctorProfileService.GetAllDoctorProfilesAsync();
            var dtoList = _mapper.Map<IEnumerable<DoctorProfileDTO>>(doctorProfiles);
            return Ok(dtoList);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDoctorProfile(string id)
        {
            var doctorProfile = await _doctorProfileService.GetDoctorProfileByIdAsync(id);
            if (doctorProfile == null) return NotFound();
            var dto = _mapper.Map<DoctorProfileDTO>(doctorProfile);
            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDoctorProfile([FromBody] DoctorProfileDTO dto)
        {
            if (string.IsNullOrEmpty(dto.Id) || string.IsNullOrEmpty(dto.DoctorId)) return BadRequest();
            try
            {
                var doctorProfile = _mapper.Map<DoctorProfile>(dto);
                await _doctorProfileService.CreateDoctorProfileAsync(doctorProfile);
                var createdDto = _mapper.Map<DoctorProfileDTO>(doctorProfile);
                return CreatedAtAction(nameof(GetDoctorProfile), new { id = createdDto.Id }, createdDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateDoctorProfile([FromBody] DoctorProfileDTO dto)
        {
            if (string.IsNullOrEmpty(dto.Id)) return BadRequest();
            try
            {
                var doctorProfile = _mapper.Map<DoctorProfile>(dto);
                await _doctorProfileService.UpdateDoctorProfileAsync(doctorProfile);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctorProfile(string id)
        {
            await _doctorProfileService.DeleteDoctorProfileAsync(id);
            return NoContent();
        }
    }
}
