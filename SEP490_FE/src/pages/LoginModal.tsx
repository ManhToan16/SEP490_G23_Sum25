import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { X, User, Lock } from 'lucide-react';
import { useToast } from '@/shared/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import authService from '@/shared/services/authService';
import { useDispatch } from "react-redux";
import { setUser } from "@/shared/store/slices/authSlice";

const LoginModal = ({ onClose }) => {
  const [userType, setUserType] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      toast({
        title: 'Lỗi đăng nhập',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { user, token } = await authService.login(
        credentials.username,
        credentials.password
      );

      dispatch(setUser(user));
      localStorage.setItem("clinic_auth_token", token);
      localStorage.setItem("clinic_user_data", JSON.stringify(user));

      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng ${user?.role}`,
        variant: 'success',
      });

      // Điều hướng dựa trên role hoặc userType đã chọn
      switch (user?.role ) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'DOCTOR':
          navigate('/doctor/dashboard');
          break;
        case 'NURSE':
          navigate('/staff/schedule');
          break;
        case 'RECEPTIONIST':
          navigate('/receptionist/dashboard');
          break;
        case 'TECHNICIAN':
          navigate('/staff/schedule');
          break;
        default:
          navigate('/dashboard');
      }

      onClose();
    } catch (error) {
      let msg = error?.response?.data?.Message || error?.response?.data?.message || error.message || 'Thông tin không hợp lệ';
      if (error?.response?.status === 403 && !msg.includes('Tài khoản bạn đã bị chặn')) {
        msg += ' Tài khoản bạn đã bị chặn.';
      }
      toast({
        title: 'Lỗi đăng nhập',
        description: msg,
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập email',
        variant: 'destructive',
      });
      return;
    }
    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      toast({
        title: 'Thành công',
        description: 'Vui lòng kiểm tra email để đặt lại mật khẩu.',
        variant: 'success',
      });
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: err?.response?.data?.message || 'Có lỗi xảy ra!',
        variant: 'destructive',
      });
    } finally {
      setForgotLoading(false);
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
          <div className="text-center mt-2">
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm"
              onClick={() => setShowForgotModal(true)}
            >
              Quên mật khẩu?
            </button>
          </div>
        </form>
      </Card>
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 relative">
            <Button
              onClick={() => setShowForgotModal(false)}
              variant="ghost"
              className="absolute right-2 top-2 p-2"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Quên mật khẩu</h2>
              <p className="text-gray-600">Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="forgot-email">Email *</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={forgotLoading || !forgotEmail}>
                {forgotLoading ? 'Đang gửi...' : 'Gửi'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LoginModal;
