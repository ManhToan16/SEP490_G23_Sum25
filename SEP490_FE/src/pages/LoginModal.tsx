
import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { X, User, Lock } from 'lucide-react';
import { useToast } from '@/shared/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ onClose }) => {
  const [userType, setUserType] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Demo login logic
    if (credentials.username && credentials.password && userType) {
      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng ${userType}`,
      });
      
      console.log('Login successful', { userType, credentials });
      
      // Navigate based on user type
      switch (userType) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'doctor':
          navigate('/doctor-dashboard');
          break;
        case 'nurse':
          navigate('/nurse-dashboard');
          break;
        case 'receptionist':
          navigate('/receptionist-dashboard');
          break;
        case 'technician':
          navigate('/technician-dashboard');
          break;
        default:
          navigate('/dashboard');
      }
      
      onClose();
    } else {
      toast({
        title: "Lỗi đăng nhập",
        description: "Vui lòng điền đầy đủ thông tin",
        // variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 relative">
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute right-2 top-2 p-2"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng Nhập</h2>
          <p className="text-gray-600">Dành cho nhân viên y tế</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="userType">Loại tài khoản *</Label>
            <Select value={userType} onValueChange={setUserType} required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại tài khoản" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Quản trị viên</SelectItem>
                <SelectItem value="doctor">Bác sĩ</SelectItem>
                <SelectItem value="nurse">Y tá</SelectItem>
                <SelectItem value="receptionist">Lễ tân</SelectItem>
                <SelectItem value="technician">Kỹ thuật viên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="username">Tên đăng nhập *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                className="pl-10"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Mật khẩu *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                className="pl-10"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Đăng Nhập
          </Button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Demo Accounts:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Admin: admin / admin123</div>
            <div>Bác sĩ: doctor / doctor123</div>
            <div>Y tá: nurse / nurse123</div>
            <div>Lễ tân: receptionist / rec123</div>
            <div>Kỹ thuật viên: tech / tech123</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginModal;
