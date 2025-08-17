import apiClient from "./apiClient";

// Interfaces cho Doctor Profile
interface CreateDoctorProfileDTO {
  doctorId: string;
  qualifications?: string;
  yearsOfExperience?: number;
  biography?: string;
  avatar?: string;
}

interface DoctorProfileData {
  id: string;
  doctorId: string;
  qualifications?: string;
  yearsOfExperience?: number;
  biography?: string;
  avatar?: string;
  name?: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
}

// Doctor Avatar Service - Quản lý upload avatar cho bác sĩ
export const doctorAvatarService = {
  // Upload avatar cho doctor profile
  uploadAvatar: async (doctorProfileId: string, avatarFile: File): Promise<any> => {
    try {
      const url = `/Doctor/Profiles/${doctorProfileId}/upload-avatar`;  
      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // API trả về: { statusCode: 201, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 201) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      // Thêm thông tin chi tiết về lỗi
      if (error.response?.status === 415) {
        throw new Error('Định dạng file không được hỗ trợ. Vui lòng chọn file JPG, PNG hoặc GIF.');
      }
      throw error;
    }
  },

  // Lấy danh sách tất cả doctor profiles với filtering và phân trang
  getAllDoctorProfiles: async (params?: {
    qualifications?: string;
    minYearsOfExperience?: number;
    maxYearsOfExperience?: number;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.qualifications) {
        queryParams.append('qualifications', params.qualifications);
      }
      if (params?.minYearsOfExperience !== undefined) {
        queryParams.append('minYearsOfExperience', params.minYearsOfExperience.toString());
      }
      if (params?.maxYearsOfExperience !== undefined) {
        queryParams.append('maxYearsOfExperience', params.maxYearsOfExperience.toString());
      }
      if (params?.pageNumber !== undefined) {
        queryParams.append('pageNumber', params.pageNumber.toString());
      }
      if (params?.pageSize !== undefined) {
        queryParams.append('pageSize', params.pageSize.toString());
      }

      const url = `/Doctor/Profiles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get(url);
      
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      throw error;
    }
  },

  // Tạo mới doctor profile
  createDoctorProfile: async (doctorProfileData: CreateDoctorProfileDTO): Promise<any> => {
    try {
      const url = `/Doctor/Profiles`;
      
      // Validate required fields theo CreateDoctorProfileDTO
      if (!doctorProfileData.doctorId) {
        throw new Error('Mã bác sĩ là bắt buộc');
      }
      
      // Validate yearsOfExperience range (0-60)
      if (doctorProfileData.yearsOfExperience !== undefined && 
          (doctorProfileData.yearsOfExperience < 0 || doctorProfileData.yearsOfExperience > 60)) {
        throw new Error('Số năm kinh nghiệm phải từ 0 đến 60');
      }
      
      const response = await apiClient.post(url, doctorProfileData);
      
      // API trả về: { statusCode: 201, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 201) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      // Thêm thông tin chi tiết về lỗi
      if (error.response?.status === 400) {
        throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
      } else if (error.response?.status === 401) {
        throw new Error('Không có quyền tạo hồ sơ. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền tạo hồ sơ bác sĩ.');
      }
      throw error;
    }
  },

  // Cập nhật doctor profile theo ID
  updateDoctorProfile: async (id: string, doctorProfileData: Partial<CreateDoctorProfileDTO>): Promise<any> => {
    try {
      const url = `/Doctor/Profiles/${id}`;
      
      const response = await apiClient.put(url, doctorProfileData);
      
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      throw error;
    }
  },

  // Lấy doctor profile theo ID
  getDoctorProfileById: async (doctorId: string): Promise<any> => {
    try {
      const url = `/Doctor/Profiles/${doctorId}`;
      
      const response = await apiClient.get(url);
      
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      throw error;
    }
  },

  // Xóa doctor profile theo ID
  deleteDoctorProfile: async (id: string): Promise<any> => {
    try {
      const url = `/Doctor/Profiles/${id}`;
      
      const response = await apiClient.delete(url);
      
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      throw error;
    }
  },

  // Có thể thêm các hàm khác liên quan đến avatar trong tương lai
  // Ví dụ: deleteAvatar, getAvatarUrl, etc.
};

export default doctorAvatarService;
