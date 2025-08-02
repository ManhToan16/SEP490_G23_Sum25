using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SEP490_BE.Constants;
using SEP490_BE.DTO.MaterialDTO;
using SEP490_BE.DTO;
using SEP490_BE.Services.MaterialServices;

namespace SEP490_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialsController : ControllerBase
    {
        private readonly IMaterialService _materialService;
      

        public MaterialsController(IMaterialService materialService)
        {
            _materialService = materialService;
        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPost]
        public async Task<IActionResult> CreateMaterial([FromBody] CreateMaterialDTO request)
        {
            var material = await _materialService.CreateMaterial(request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status201Created,
                Success = true,
                Message = MessageConstants.POST_SUCCESS,
                Data = new[] { material }
            });
        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMaterial(string id, [FromBody] UpdateMaterialDTO request)
        {

            var material = await _materialService.UpdateMaterial(id, request);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.PUT_SUCCESS,
                Data = new[] { material }
            });
        }
        [Authorize(Roles = RoleConstants.Admin)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMaterial(string id)
        {
            await _materialService.DeleteMaterial(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.DELETE_SUCCESS,
                Data = null
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMaterialById(string id)
        {
            var material = await _materialService.GetMaterialById(id);
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { material }
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMaterials()
        {
            var pagination = await _materialService.GetAllMaterials();
            return Ok(new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Success = true,
                Message = MessageConstants.GET_SUCCESS,
                Data = new[] { pagination }
            });
        }
    }
}
