
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, Award, Loader2, Camera } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { useAppDispatch, useAppSelector } from "@/shared/store";
import {
  fetchDoctorProfile,
  updateDoctorProfile,
  createDoctorProfile,
  clearError,
  clearSuccess,
} from "@/shared/store/slices/doctorProfileSlice";
import { toast } from "sonner";
import { useToast } from "@/shared/components/ui/use-toast";

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
        title: "Cập nhật hồ sơ thành công!",
        variant: "success",
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
  }, [success, error, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "yearsOfExperience" ? parseInt(value) || 0 : value
    }));
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
          )}
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                  {profile?.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="text-white" size={36} />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                    <Camera size={16} className="text-gray-600" />
                  </button>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                <Award size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <p className="text-gray-900 py-2 leading-relaxed">
                    {formData.biography || (
                      <span className="text-gray-400 italic">Chưa cập nhật</span>
                    )}
                  </p>
                )}
              </div>

              {/* Avatar URL */}
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Avatar
                  </label>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
