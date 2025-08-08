import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Lock, Loader2, Edit2, Save, X, User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { appointmentService } from '@/shared/services';

interface UserDetailInfo {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface UserProfileCommonProps {
  user?: any;
  title?: string;
  roleName?: string;
  roleColor?: string;
}

const UserProfileCommon: React.FC<UserProfileCommonProps> = ({ 
  user, 
  title = "Thông tin cá nhân",
  roleName = "Admin",
  roleColor = "bg-gray-100 text-gray-800"
}) => {
  const [userDetail, setUserDetail] = useState<UserDetailInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    password: '',
    repassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    address: user?.address || '',
    role: user?.role || '',
  });

  const fetchUserDetail = useCallback(async () => {
    if (!user?.UserId) {
      setError('Không tìm thấy ID người dùng');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await appointmentService.getUserDetail(user.UserId);
      
      // API trả về data trong array, lấy phần tử đầu tiên
      let userData;
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        userData = response.data[0];
      } else if (response && response.data) {
        // Nếu data không phải array
        userData = response.data;
      } else {
        throw new Error('Invalid user data format');
      }
      
      setUserDetail(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        address: userData.address || '',
        role: userData.role || '',
      });
    } catch (error: any) {
      setError(error?.response?.data?.Message || error.message || 'Có lỗi xảy ra khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  }, [user?.UserId]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = async () => {
    // Validate password fields
    if (!passwordData.oldPassword.trim()) {
      setPasswordError('Mật khẩu cũ không được để trống');
      return;
    }

    if (!passwordData.password.trim()) {
      setPasswordError('Mật khẩu mới không được để trống');
      return;
    }

    if (!passwordData.repassword.trim()) {
      setPasswordError('Xác nhận mật khẩu không được để trống');
      return;
    }

    if (passwordData.password !== passwordData.repassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (passwordData.password.length < 8) {
      setPasswordError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await appointmentService.changePassword(passwordData);
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setPasswordData({
        oldPassword: '',
        password: '',
        repassword: ''
      });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(null);
      }, 2000);

    } catch (error: any) {
      setPasswordError(error?.response?.data?.Message || error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.UserId) {
      setSaveError('Không tìm thấy ID người dùng');
      return;
    }

    // Validate form data
    if (!formData.name.trim()) {
      setSaveError('Họ và tên không được để trống');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setSaveError('Số điện thoại không được để trống');
      return;
    }

    // Validate phone number format (Vietnamese format)
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setSaveError('Số điện thoại không hợp lệ (định dạng: 03xxxxxxxx, 05xxxxxxxx, 07xxxxxxxx, 08xxxxxxxx, 09xxxxxxxx)');
      return;
    }

    if (!formData.email.trim()) {
      setSaveError('Email không được để trống');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSaveError('Email không hợp lệ');
      return;
    }

    if (!formData.dateOfBirth) {
      setSaveError('Ngày sinh không được để trống');
      return;
    }

    if (!formData.gender) {
      setSaveError('Giới tính không được để trống');
      return;
    }

    if (!formData.role) {
      setSaveError('Vai trò không được để trống');
      return;
    }

    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      await appointmentService.updateUser(user.UserId, formData);
      setSaveSuccess('Cập nhật thông tin thành công!');
      
      // Refresh user data
      await fetchUserDetail();
      
      // Exit edit mode after 2 seconds
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(null);
      }, 2000);

    } catch (error: any) {
      setSaveError(error?.response?.data?.Message || error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userDetail?.name || user?.name || '',
      email: userDetail?.email || user?.email || '',
      phoneNumber: userDetail?.phoneNumber || user?.phoneNumber || '',
      dateOfBirth: userDetail?.dateOfBirth || user?.dateOfBirth || '',
      gender: userDetail?.gender || user?.gender || '',
      address: userDetail?.address || user?.address || '',
      role: userDetail?.role || user?.role || '',
    });
    setSaveError(null);
    setSaveSuccess(null);
  };

  const displayUser = userDetail || user;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className={roleColor}>
            {roleName}
          </Badge>
          <Badge 
            variant="secondary" 
            className={`mt-1 ${displayUser?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {displayUser?.isActive ? 'Hoạt động' : 'Không hoạt động'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Thông tin cơ bản</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Họ và tên</Label>
                <div className="mt-1 text-sm text-gray-900">{displayUser?.name}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <div className="mt-1 text-sm text-gray-900">{displayUser?.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Số điện thoại</Label>
                <div className="mt-1 text-sm text-gray-900">{displayUser?.phoneNumber}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Ngày sinh</Label>
                <div className="mt-1 text-sm text-gray-900">
                  {displayUser?.dateOfBirth ? new Date(displayUser.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Giới tính</Label>
                <div className="mt-1 text-sm text-gray-900">{displayUser?.gender || 'Chưa cập nhật'}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Địa chỉ</Label>
                <div className="mt-1 text-sm text-gray-900">{displayUser?.address || 'Chưa cập nhật'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Thông tin tài khoản</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Vai trò</Label>
                <div className="mt-1 text-sm text-gray-900">{displayUser?.role}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Trạng thái</Label>
                <div className="mt-1">
                  <Badge 
                    variant="secondary" 
                    className={displayUser?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {displayUser?.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        {!isEditing ? (
          <>
            <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
              <Edit2 className="h-4 w-4" />
              <span>Chỉnh sửa</span>
            </Button>
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Thay đổi mật khẩu</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thay đổi mật khẩu</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                      placeholder="Nhập mật khẩu cũ"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Mật khẩu mới</Label>
                    <Input
                      id="password"
                      type="password"
                      value={passwordData.password}
                      onChange={(e) => handlePasswordChange('password', e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>
                  <div>
                    <Label htmlFor="repassword">Xác nhận mật khẩu mới</Label>
                    <Input
                      id="repassword"
                      type="password"
                      value={passwordData.repassword}
                      onChange={(e) => handlePasswordChange('repassword', e.target.value)}
                      placeholder="Xác nhận mật khẩu mới"
                    />
                  </div>
                  {passwordError && (
                    <div className="text-red-500 text-sm">{passwordError}</div>
                  )}
                  {passwordSuccess && (
                    <div className="text-green-500 text-sm">{passwordSuccess}</div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsPasswordModalOpen(false)}
                      disabled={passwordLoading}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                      className="flex items-center space-x-2"
                    >
                      {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>Đổi mật khẩu</span>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <Button 
              onClick={handleSave} 
              disabled={saveLoading}
              className="flex items-center space-x-2"
            >
              {saveLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              <span>Lưu</span>
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex items-center space-x-2">
              <X className="h-4 w-4" />
              <span>Hủy</span>
            </Button>
          </>
        )}
      </div>

      {/* Error and Success Messages */}
      {saveError && (
        <div className="text-red-500 text-sm">{saveError}</div>
      )}
      {saveSuccess && (
        <div className="text-green-500 text-sm">{saveSuccess}</div>
      )}

      {/* Editable Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa thông tin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Nhập email"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Giới tính</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <Label htmlFor="role">Vai trò</Label>
                <select
                  id="role"
                  value={formData.role}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-gray-600"
                >
                  <option value="">Chọn vai trò</option>
                  <option value="Admin">Admin</option>
                  <option value="Doctor">Bác sĩ</option>
                  <option value="Nurse">Y tá</option>
                  <option value="Receptionist">Lễ tân</option>
                  <option value="Technician">Kỹ thuật viên</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Nhập địa chỉ"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProfileCommon;
