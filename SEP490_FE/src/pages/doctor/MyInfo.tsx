
import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Calendar, Edit3, Save, Award, Loader2, Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "@/shared/store";
import {
  fetchDoctorProfile,
  updateDoctorProfile,
  createDoctorProfile,
  clearError,
  clearSuccess,
} from "@/shared/store/slices/doctorProfileSlice";
import { useToast } from "@/shared/components/ui/use-toast";
import { doctorAvatarService } from "@/shared/services/doctorAvatarService";

// Interface cho doctor profile response (inline type theo yêu cầu)
interface DoctorProfileData {
  id: string;
  doctorId: string;
  qualifications: string;
  yearsOfExperience: number;
  biography: string;
  avatar: string;
  name: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
}

interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: DoctorProfileData[];
}

const DoctorProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading, error, success } = useAppSelector(
    (state) => state.doctorProfile
  );
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    qualifications: '',
    yearsOfExperience: 0,
    biography: '',
    avatar: ''
  });
  
  // Avatar upload states
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get doctor ID from localStorage
  const getDoctorIdFromLocalStorage = () => {
    try {
      const userData = localStorage.getItem('clinic_user_data');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.UserId;
      }
      return null;
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      return null;
    }
  };

  // Get doctor name from localStorage
  const getDoctorNameFromLocalStorage = () => {
    try {
      const userData = localStorage.getItem('clinic_user_data');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.unique_name;
      }
      return null;
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      return null;
    }
  };

  const doctorId = getDoctorIdFromLocalStorage();
  const doctorName = getDoctorNameFromLocalStorage();

  // Load doctor profile on component mount
  useEffect(() => {
    if (doctorId) {
      dispatch(fetchDoctorProfile(doctorId));
    }
  }, [dispatch, doctorId]);

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        qualifications: profile.qualifications || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        biography: profile.biography || '',
        avatar: profile.avatar || ''
      });
    }
  }, [profile]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      toast({
        title: "Thành công",
        description: "Cập nhật hồ sơ thành công!",
        variant: "default",
      });
      setIsEditing(false);
      dispatch(clearSuccess());
    }
    if (error) {
      toast({
        title: "Lỗi",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [success, error, dispatch, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "yearsOfExperience" ? parseInt(value) || 0 : value
    }));
  };

  // Avatar upload handlers
  const handleAvatarClick = () => {
    if (isEditing) {
      setShowAvatarModal(true);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file) {
      // Validate file type - chỉ chấp nhận các định dạng phổ biến
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Lỗi",
          description: "Chỉ chấp nhận file JPG, PNG hoặc GIF",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước file không được vượt quá 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file name - không chấp nhận ký tự đặc biệt
      const fileName = file.name.toLowerCase();
      if (!fileName.match(/^[a-zA-Z0-9\s\-_.]+\.(jpg|jpeg|png|gif)$/)) {
        toast({
          title: "Lỗi",
          description: "Tên file không được chứa ký tự đặc biệt",
          variant: "destructive",
        });
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !profile?.id) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh để upload",
        variant: "destructive",
      });
      return;
    }



    setIsUploading(true);
    try {
              const response = await doctorAvatarService.uploadAvatar(profile.id, avatarFile);
      

      
             // Kiểm tra response structure và lấy avatar URL
       let avatarUrl = '';
       
       if (response && response.data) {
         // Nếu data là array
         if (Array.isArray(response.data) && response.data.length > 0) {
           const firstItem = response.data[0];
           // Kiểm tra nếu firstItem là object có avatar field
           if (typeof firstItem === 'object' && firstItem.avatar) {
             avatarUrl = firstItem.avatar;
           } else {
             avatarUrl = firstItem;
           }
         } 
         // Nếu data là string trực tiếp
         else if (typeof response.data === 'string') {
           avatarUrl = response.data;
         }
         // Nếu data là object có avatar field
         else if (response.data.avatar) {
           avatarUrl = response.data.avatar;
         }
       }
       

      
      if (avatarUrl) {
        // Update local state
        setFormData(prev => ({ ...prev, avatar: avatarUrl }));
        
                 // Update profile in store
         if (profile) {
           dispatch(updateDoctorProfile({
             doctorId: profile.id,
             data: {
               doctorId: profile.doctorId,
               qualifications: profile.qualifications,
               yearsOfExperience: profile.yearsOfExperience,
               biography: profile.biography,
               avatar: avatarUrl
             }
           }));
         }

        toast({
          title: "Thành công",
          description: "Upload avatar thành công!",
          variant: "default",
        });

        // Close modal and reset states
        setShowAvatarModal(false);
        setAvatarFile(null);
        setAvatarPreview('');
      } else {
        throw new Error('Không thể lấy URL avatar từ response');
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      
      // Lấy error message chi tiết
      let errorMessage = "Có lỗi xảy ra khi upload avatar";
      
      if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!doctorId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin người dùng",
        variant: "destructive",
      });
      return;
    }

    const profileData = {
      doctorId: doctorId,
      qualifications: formData.qualifications,
      yearsOfExperience: formData.yearsOfExperience,
      biography: formData.biography,
      avatar: formData.avatar
    };



    if (profile?.id) {
      // Update existing profile

      dispatch(updateDoctorProfile({ doctorId: profile.id, data: profileData }));
    } else {
      // Create new profile

      dispatch(createDoctorProfile(profileData));
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        qualifications: profile.qualifications || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        biography: profile.biography || '',
        avatar: profile.avatar || ''
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-clinic-navy mb-2">
            Hồ Sơ Chuyên Môn
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin hồ sơ chuyên môn bác sĩ
          </p>
        </div>
        
        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
          )}
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-clinic-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isEditing ? (
              <Save size={20} />
            ) : (
              <Edit3 size={20} />
            )}
            <span>{loading ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-center space-y-4">
              {/* Avatar */}
              <div className="relative">
                <div 
                  className={`w-24 h-24 bg-clinic-blue rounded-full flex items-center justify-center mx-auto shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                    isEditing ? 'hover:scale-105' : ''
                  }`}
                  onClick={handleAvatarClick}
                >
                  {formData.avatar ? (
                    <img 
                      src={formData.avatar} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="text-white" size={36} />
                  )}
                </div>
                {isEditing && (
                  <button 
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-clinic-blue shadow-md hover:bg-gray-50 transition-colors"
                    onClick={handleAvatarClick}
                  >
                    <Camera size={16} className="text-clinic-blue" />
                  </button>
                )}
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-2">
                    Nhấp để thay đổi avatar
                  </p>
                )}
              </div>

              {/* Name & Basic Info from auth user */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile?.name || doctorName || user?.name || 'Bác sĩ'}
                </h2>
                <p className="text-sm text-gray-500">
                  {formData.qualifications || 'Chưa cập nhật chuyên môn'}
                </p>
              </div>

              {/* Experience Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-clinic-blue/10 rounded-full border border-clinic-blue/20">
                <Award size={16} className="text-clinic-blue" />
                <span className="text-sm font-medium text-clinic-blue">
                  {formData.yearsOfExperience || 0} năm kinh nghiệm
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {profile?.email || user?.email || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {profile?.phoneNumber || user?.phoneNumber || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {profile?.dateOfBirth ? 
                    new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : 
                    'Chưa cập nhật'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Editable Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Thông tin chuyên môn
            </h3>
            
            <div className="space-y-6">
              {/* Qualifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trình độ chuyên môn *
                </label>
                {isEditing ? (
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  placeholder="VD: Thạc sĩ Y học thần kinh - Đại học Y Dược TP.HCM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue focus:border-transparent"
                />
                ) : (
                  <p className="text-gray-900 py-2">
                    {formData.qualifications || (
                      <span className="text-gray-400 italic">Chưa cập nhật</span>
                    )}
                  </p>
                )}
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số năm kinh nghiệm *
                </label>
                {isEditing ? (
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  placeholder="VD: 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue focus:border-transparent"
                />
                ) : (
                  <p className="text-gray-900 py-2">
                    {formData.yearsOfExperience || 0} năm
                  </p>
                )}
              </div>

              {/* Biography */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiểu sử chuyên môn
                </label>
                {isEditing ? (
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="VD: Bác sĩ chuyên điều trị các bệnh về thần kinh trung ương và tâm lý như rối loạn lo âu, trầm cảm, và rối loạn giấc ngủ."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue focus:border-transparent resize-none"
                />
                ) : (
                  <p className="text-gray-900 py-2 leading-relaxed">
                    {formData.biography || (
                      <span className="text-gray-400 italic">Chưa cập nhật</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Thay đổi Avatar
              </h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-clinic-blue bg-clinic-blue/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {avatarPreview ? (
                <div className="space-y-4">
                  <img 
                    src={avatarPreview} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200"
                  />
                  <p className="text-sm text-gray-600">
                    {avatarFile?.name}
                  </p>
                  <button
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview('');
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Chọn lại
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <ImageIcon size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Kéo thả file ảnh vào đây hoặc
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-clinic-blue hover:text-clinic-blue/80 font-medium"
                    >
                      Chọn file
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Hỗ trợ: JPG, PNG, GIF (tối đa 5MB, tên file không chứa ký tự đặc biệt)
                  </p>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUploadAvatar}
                disabled={!avatarFile || isUploading}
                className="flex-1 px-4 py-2 bg-clinic-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Đang upload...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Avatar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
