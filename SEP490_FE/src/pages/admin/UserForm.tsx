
import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useToast } from '@/shared/components/ui/use-toast';
import { Textarea } from '@/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { X } from 'lucide-react';

const UserForm = ({ userType, user, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    password: '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || 'MALE',
    address: user?.address || '',
    role: user?.role || getDefaultRole(userType)
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
  }>({});

  const { toast } = useToast();

  function getDefaultRole(userType) {
    switch (userType) {
      case 'user-doctors': return 'DOCTOR';
      case 'user-receptionists': return 'RECEPTIONIST';
      case 'user-technicians': return 'TECHNICIAN';
      case 'user-admins': return 'ADMIN';
      default: return 'PATIENT';
    }
  }

  // Update form data when user changes (for editing)
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        password: '', // Always empty for edit
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || 'MALE',
        address: user.address || '',
        role: user.role || getDefaultRole(userType)
      });
    } else {
      // Reset form for new user
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        dateOfBirth: '',
        gender: 'MALE',
        address: '',
        role: getDefaultRole(userType) // Auto-set role based on card
      });
    }
  }, [user, userType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      password?: string;
    } = {};
    
    // Validate required fields
    if (!formData.name) newErrors.name = "Vui lòng nhập họ tên";
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    // Kiểm tra họ tên: từ 2 đến 100 ký tự
    if (formData.name && (formData.name.length < 2 || formData.name.length > 100)) newErrors.name = "Họ tên phải từ 2 đến 100 ký tự.";
    // Kiểm tra họ tên: không chứa ký tự đặc biệt
    if (formData.name && !/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.name)) newErrors.name = "Họ tên không được chứa ký tự đặc biệt.";
    // Kiểm tra số điện thoại: đúng định dạng Việt Nam (03,05,07,08,09 + 8 số)
    if (formData.phoneNumber && !/^(03|05|07|08|09)\d{8}$/.test(formData.phoneNumber)) newErrors.phoneNumber = "Số điện thoại không đúng định dạng.";
    // Nếu tạo mới thì bắt buộc có mật khẩu
    if (!user && !formData.password) newErrors.password = "Mật khẩu là bắt buộc khi tạo tài khoản mới";
    // Kiểm tra mật khẩu: ít nhất 8 ký tự (chỉ khi tạo mới hoặc đổi mật khẩu)
    if (((!user && formData.password.length < 8) || (user && formData.password && formData.password.length < 8))) newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast({ title: "Lỗi", description: String(Object.values(newErrors)[0]) });
      return;
    }

    // Format data for API
    const apiData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
    };

    // Remove password if updating existing user and password is empty
    if (user && !formData.password) {
      delete apiData.password;
    }

    onSave(apiData);
    toast({
      title: `${user ? 'Cập nhật' : 'Thêm'} thành công!`,
      description: `${getUserTypeDisplay(userType)} đã được ${user ? 'cập nhật' : 'thêm'} vào hệ thống.`,
    });
  };

  const getUserTypeDisplay = (type) => {
    switch (type) {
      case 'user-doctors': return 'Bác Sĩ';
      case 'user-receptionists': return 'Lễ Tân';
      case 'user-technicians': return 'Kỹ Thuật Viên';
      case 'user-admins': return 'Quản Trị Viên';
      default: return type;
    }
  };

  const handleClose = () => {
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{user ? 'Chỉnh Sửa' : 'Thêm'} {getUserTypeDisplay(userType)}</span>
        
          </DialogTitle>
          {!user && (
            <p className="text-sm text-gray-500">
              Tài khoản sẽ được tạo với vai trò: <span className="font-medium">{getUserTypeDisplay(userType)}</span>
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Tên *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nhập họ và tên"
                required
                className={errors?.name ? "border-red-500" : ""}
              />
              {errors?.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="example@clinic.com"
                required
                className={errors?.email ? "border-red-500" : ""}
              />
              {errors?.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNumber">Số điện thoại *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="0987654321"
                required
                className={errors?.phoneNumber ? "border-red-500" : ""}
              />
              {errors?.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>
            
            <div>
              <Label htmlFor="password">{user ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder={user ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                required={!user}
                className={errors?.password ? "border-red-500" : ""}
              />
              {errors?.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="gender">Giới tính</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Nhập địa chỉ"
              rows={3}
            />
          </div>

          {/* Role field - only show when editing existing user */}
          {user && (
            <div>
              <Label htmlFor="role">Vai trò</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCTOR">Bác Sĩ</SelectItem>
                  <SelectItem value="RECEPTIONIST">Lễ Tân</SelectItem>
                  <SelectItem value="TECHNICIAN">Kỹ Thuật Viên</SelectItem>
                  <SelectItem value="ADMIN">Quản Trị Viên</SelectItem>
                  <SelectItem value="PATIENT">Bệnh Nhân</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Có thể thay đổi vai trò người dùng khi chỉnh sửa
              </p>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {user ? 'Cập Nhật' : 'Thêm Mới'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
