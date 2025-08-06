
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

const UserForm = ({ userType, user, onSave, onCancel, isOpen, existingUsers = [] }) => {
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

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    dateOfBirth: ''
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phoneNumber: false,
    password: false,
    dateOfBirth: false
  });

  const { toast } = useToast();

  function getDefaultRole(userType) {
    switch (userType) {
      case 'user-doctors': return 'DOCTOR';
      case 'user-receptionists': return 'RECEPTIONIST';
      case 'user-technicians': return 'TECHNICIAN';
      case 'user-nurses': return 'NURSE';
      case 'user-admins': return 'ADMIN';
      default: return 'PATIENT';
    }
  }

  // Validation functions
  const validateName = (name) => {
    if (!name) return 'Họ tên là bắt buộc';
    if (name.length < 2 || name.length > 100) return 'Họ tên phải từ 2 đến 100 ký tự';
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name)) return 'Họ tên không được chứa ký tự đặc biệt';
    
    // Kiểm tra khoảng trắng thừa
    if (name.trim() !== name) return 'Họ tên không được chứa khoảng trắng thừa ở đầu hoặc cuối';
    
    // Kiểm tra khoảng trắng liên tiếp
    if (/\s{2,}/.test(name)) return 'Họ tên không được chứa nhiều khoảng trắng liên tiếp';
    
    // Kiểm tra tên có ít nhất 2 từ
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) return 'Họ tên phải có ít nhất 2 từ (họ và tên)';
    
    // Kiểm tra mỗi từ có ít nhất 2 ký tự
    for (const part of nameParts) {
      if (part.length < 2) return 'Mỗi từ trong họ tên phải có ít nhất 2 ký tự';
    }
    
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email là bắt buộc';
    
    // Kiểm tra khoảng trắng
    if (email.trim() !== email) return 'Email không được chứa khoảng trắng';
    
    // Kiểm tra định dạng email cơ bản
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Địa chỉ email không đúng định dạng';
    
    // Kiểm tra độ dài email
    if (email.length > 254) return 'Email quá dài (tối đa 254 ký tự)';
    
    // Kiểm tra domain hợp lệ
    const emailParts = email.split('@');
    if (emailParts[1].length < 3) return 'Domain email không hợp lệ';
    
    // Kiểm tra ký tự đặc biệt không hợp lệ
    if (/[<>()[\]\\,;:\s"]/.test(email)) return 'Email chứa ký tự không hợp lệ';
    
    // Check for duplicate email (excluding current user if editing)
    const existingUser = existingUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && u.id !== user?.id
    );
    if (existingUser) return 'Email đã được đăng ký';
    
    return '';
  };

  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return 'Số điện thoại là bắt buộc';
    
    // Loại bỏ khoảng trắng và ký tự đặc biệt
    const cleanPhone = phoneNumber.replace(/[\s\-()]/g, '');
    
    // Kiểm tra chỉ chứa số
    if (!/^\d+$/.test(cleanPhone)) return 'Số điện thoại chỉ được chứa chữ số';
    
    // Kiểm tra độ dài
    if (cleanPhone.length !== 10) return 'Số điện thoại phải gồm 10 chữ số';
    
    // Kiểm tra đầu số Việt Nam
    if (!/^(03|05|07|08|09)/.test(cleanPhone)) return 'Số điện thoại không đúng định dạng Việt Nam';
    
    // Kiểm tra số điện thoại không được giống nhau
    if (/(\d)\1{8}/.test(cleanPhone)) return 'Số điện thoại không hợp lệ (chứa quá nhiều số giống nhau)';
    
    // Check for duplicate phone number (excluding current user if editing)
    const existingUser = existingUsers.find(u => 
      u.phoneNumber === cleanPhone && u.id !== user?.id
    );
    if (existingUser) return 'Số điện thoại đã được đăng ký';
    
    return '';
  };

  const validatePassword = (password) => {
    // Skip password validation when editing existing user
    if (user) return '';
    
    if (!password) return 'Mật khẩu là bắt buộc khi tạo tài khoản mới';
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
    
    if (password) {
      // Kiểm tra độ dài tối đa
      if (password.length > 128) return 'Mật khẩu quá dài (tối đa 128 ký tự)';
      
      // Kiểm tra khoảng trắng
      if (password.trim() !== password) return 'Mật khẩu không được chứa khoảng trắng ở đầu hoặc cuối';
    }
    
    return '';
  };

  const validateDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) return 'Ngày sinh là bắt buộc';
    
    const selectedDate = new Date(dateOfBirth);
    const today = new Date();
    
    // Reset time to start of day for both dates to compare only the date part
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return 'Ngày sinh không được trong tương lai';
    }
    
    return '';
  };

  // Real-time validation
  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'phoneNumber':
        return validatePhoneNumber(value);
      case 'password':
        return validatePassword(value);
      case 'dateOfBirth':
        return validateDateOfBirth(value);
      default:
        return '';
    }
  };

  // Handle field change with validation
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate field if it has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Handle field blur (mark as touched and validate)
  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

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
        role: getDefaultRole(userType)
      });
    }
    
    // Reset errors and touched states
    setErrors({ name: '', email: '', phoneNumber: '', password: '', dateOfBirth: '' });
    setTouched({ name: false, email: false, phoneNumber: false, password: false, dateOfBirth: false });
  }, [user, userType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      password: validatePassword(formData.password),
      dateOfBirth: validateDateOfBirth(formData.dateOfBirth)
    };
    
    setErrors(newErrors);
    setTouched({ name: true, email: true, phoneNumber: true, password: true, dateOfBirth: true });
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      toast({ 
        title: "Lỗi", 
        description: "Vui lòng kiểm tra lại thông tin nhập vào",
        variant: 'destructive'
      });
      return;
    }

    // Format data for API
    const apiData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
    };

    // Remove password field when editing existing user
    if (user) {
      delete apiData.password;
    }

    onSave(apiData);
  };

  const getUserTypeDisplay = (type) => {
    switch (type) {
      case 'user-doctors': return 'Bác Sĩ';
      case 'user-receptionists': return 'Lễ Tân';
      case 'user-technicians': return 'Kỹ Thuật Viên';
      case 'user-nurses': return 'Y Tá';
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
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                placeholder="Nhập họ và tên"
                required
                className={errors.name ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                placeholder="example@clinic.com"
                required
                className={errors.email ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNumber">Số điện thoại *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                onBlur={() => handleFieldBlur('phoneNumber')}
                placeholder="0987654321"
                required
                className={errors.phoneNumber ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
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
            
            {/* Only show password field when creating new user */}
            {!user && (
              <div>
                <Label htmlFor="password">Mật khẩu *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleFieldBlur('password')}
                  placeholder="Nhập mật khẩu"
                  required
                  className={errors.password ? "border-red-500 focus:border-red-500" : ""}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                onBlur={() => handleFieldBlur('dateOfBirth')}
                max={new Date().toISOString().split('T')[0]}
                required
                className={errors.dateOfBirth ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
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
