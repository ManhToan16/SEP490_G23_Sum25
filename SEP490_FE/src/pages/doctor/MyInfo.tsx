
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, Award, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "@/shared/store";
import {
  fetchDoctorProfile,
  updateDoctorProfile,
  createDoctorProfile,
  clearError,
  clearSuccess,
} from "@/shared/store/slices/doctorProfileSlice";
import { toast } from "sonner";

const DoctorInfo: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading, error, success } = useAppSelector(
    (state) => state.doctorProfile
  );
  const { user } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || 'BS. Nguyễn Văn An',
    email: user?.email || 'bsnguyenvanan@phongkham.com',
    phone: user?.phone || '0912345678',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    dateOfBirth: '1985-03-15',
    gender: 'Nam',
    licenseNumber: 'BS12345',
    specialty: 'Thần kinh học',
    experience: '15',
    education: 'Tiến sĩ Y khoa - Đại học Y Dược TP.HCM',
    workingDays: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
    workingHours: '08:00 - 17:00',
    // API fields
    qualifications: '',
    yearsOfExperience: 0,
    biography: '',
    avatar: ''
  });

  // Load doctor profile on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDoctorProfile(user.id));
    }
  }, [dispatch, user?.id]);

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        // API fields - sync with API response
        qualifications: profile.qualifications || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        biography: profile.biography || '',
        avatar: profile.avatar || '',
        // Local fields - update from API if available, otherwise keep current
        experience: profile.yearsOfExperience?.toString() || prev.experience,
        specialty: profile.qualifications || prev.specialty,
        // Note: name, phoneNumber, email, dateOfBirth are null in API response
        // These fields are managed locally and from user state, not synced with this API
      }));
    }
  }, [profile]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      toast.success("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "yearsOfExperience" ? parseInt(value) || 0 : value
    });
  };

  const handleSave = () => {
    if (!user?.id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    // Prepare API data
    const profileData = {
      doctorId: user.id,
      qualifications: formData.qualifications || formData.specialty,
      yearsOfExperience: formData.yearsOfExperience || parseInt(formData.experience) || 0,
      biography: formData.biography || `Bác sĩ ${formData.fullName}`,
      avatar: formData.avatar,
    };

    if (profile?.id) {
      // Update existing profile
      dispatch(updateDoctorProfile({ doctorId: profile.id, data: profileData }));
    } else {
      // Create new profile
      dispatch(createDoctorProfile(profileData));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin hồ sơ bác sĩ
          </p>
          {profile ? (
            <div className="mt-1 text-sm text-green-600">
              ✅ Hồ sơ API đã tồn tại (ID: {profile.id?.slice(0, 8)}...)
            </div>
          ) : (
            <div className="mt-1 text-sm text-orange-600">
              ⏳ Chưa có hồ sơ API - Sẽ tạo mới khi lưu
            </div>
          )}
        </div>
        
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={loading}
          className="flex items-center space-x-2 clinic-button-primary disabled:opacity-50"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo and Basic Info */}
        <div className="clinic-card">
          <div className="text-center">
            <div className="w-32 h-32 bg-clinic-navy rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-white" size={64} />
            </div>
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-2">
              {formData.fullName}
            </h2>
            <p className="text-gray-600 mb-2">{formData.specialty}</p>
            <p className="text-sm text-gray-500">{formData.experience} năm kinh nghiệm</p>
            
            <div className="mt-4 p-3 bg-clinic-blue rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-clinic-navy">
                <Award size={20} />
                <span className="font-medium">Chứng chỉ hành nghề</span>
              </div>
              <p className="text-sm mt-1">{formData.licenseNumber}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="clinic-card">
            <h3 className="text-lg font-poppins font-semibold text-clinic-navy mb-4">
              Thông tin cá nhân
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chuyên khoa
                </label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="clinic-card">
            <h3 className="text-lg font-poppins font-semibold text-clinic-navy mb-4">
              Thông tin nghề nghiệp (Local)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số chứng chỉ hành nghề
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số năm kinh nghiệm (Local)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trình độ học vấn
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* API Profile Section */}
          <div className="clinic-card border-2 border-clinic-blue">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-poppins font-semibold text-clinic-navy">
                Hồ Sơ Bác Sĩ API 
              </h3>
              {profile && (
                <div className="text-sm text-gray-500">
                  ID: {profile.id}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-clinic-navy mb-2">
                  🎓 Bằng Cấp Chuyên Môn
                </label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Nhập bằng cấp chuyên môn..."
                  className="w-full px-3 py-2 border-2 border-clinic-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-clinic-navy mb-2">
                  📅 Số Năm Kinh Nghiệm
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="0"
                  className="w-full px-3 py-2 border-2 border-clinic-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-clinic-navy mb-2">
                  🖼️ Avatar URL
                </label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border-2 border-clinic-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-clinic-navy mb-2">
                  📝 Tiểu Sử/Mô Tả
                </label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Nhập tiểu sử hoặc mô tả về bản thân..."
                  className="w-full px-3 py-2 border-2 border-clinic-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue disabled:bg-gray-50"
                />
              </div>

              {/* Display API Response Data */}
              {profile && (
                <div className="md:col-span-2 mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">📄 Dữ Liệu API:</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Doctor ID:</strong> {profile.doctorId}</div>
                    <div><strong>Profile ID:</strong> {profile.id}</div>
                    <div><strong>Qualifications:</strong> {profile.qualifications || 'Chưa cập nhật'}</div>
                    <div><strong>Years of Experience:</strong> {profile.yearsOfExperience || 0}</div>
                    <div><strong>Biography:</strong> {profile.biography || 'Chưa cập nhật'}</div>
                    <div><strong>Avatar:</strong> {profile.avatar || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Section */}
      {profile && (
        <div className="clinic-card bg-gray-50 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">🔍 Debug - API Response</h3>
          <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-32">
            {JSON.stringify({
              "statusCode": 201,
              "success": true,
              "message": "Data loaded successfully",
              "data": [profile]
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DoctorInfo;
