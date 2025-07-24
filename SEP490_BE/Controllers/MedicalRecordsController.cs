[Authorize(Roles = RoleConstants.Doctor + "," + RoleConstants.Admin)]
[Consumes("multipart/form-data")]
[HttpPost("{medicalRecordId}/upload-document")]
public async Task<ActionResult<ApiResponse>> UploadDocument(string medicalRecordId, [FromForm] IFormFile file)
{
    var result = await _medicalRecordService.UploadMedicalRecord(medicalRecordId, file);
    return Ok(new ApiResponse
    {
        StatusCode = StatusCodes.Status201Created,
        Success = true,
        Message = MessageConstants.UPLOAD_SUCCESS,
        Data = new[] { new { url = result } }
    });
} 