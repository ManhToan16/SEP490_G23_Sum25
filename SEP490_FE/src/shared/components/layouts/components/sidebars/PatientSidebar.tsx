import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Home, 
  User, 
  FileText, 
  Calendar, 
  ClipboardList, 
  Star,
  Phone,
  Clock,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/shared/utils';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  badge?: number;
}

const PatientSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { icon: Home, label: 'Trang chủ', path: '/patient/dashboard' },
    { icon: User, label: 'Thông tin cá nhân', path: '/patient/my-info' },
    { icon: FileText, label: 'Hồ sơ bệnh án', path: '/patient/medical-records' },
    { icon: Calendar, label: 'Lịch hẹn của tôi', path: '/patient/appointments', badge: 2 },
    { icon: ClipboardList, label: 'Đặt lịch khám', path: '/patient/book-appointment' },
    { icon: Star, label: 'Đánh giá bác sĩ', path: '/patient/review-list' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-72 bg-clinic-blue/5 border-r border-clinic-blue/10 p-4 space-y-4">
      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full justify-start h-11 px-3 font-medium transition-colors",
                isActive(item.path)
                  ? "bg-clinic-blue text-white hover:bg-clinic-blue/90"
                  : "text-clinic-navy hover:bg-clinic-blue/10 hover:text-clinic-navy"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Upcoming Appointment Widget */}
      <Card className="border-clinic-blue/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-clinic-navy flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Lịch hẹn sắp tới
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-clinic-navy">BS. Nguyễn Văn A</p>
                <p className="text-xs text-gray-500">20/06/2025 - 09:00</p>
              </div>
              <Badge variant="outline" className="text-xs">Đã xác nhận</Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-clinic-navy border-clinic-blue hover:bg-clinic-blue/10"
              onClick={() => navigate('/patient/appointments')}
            >
              Xem chi tiết
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Khẩn cấp</p>
              <p className="text-xs text-red-600">0123.456.789</p>
            </div>
          </div>
          <Button 
            size="sm" 
            className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
          >
            <Phone className="w-3 h-3 mr-2" />
            Gọi ngay
          </Button>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-800 mb-1">Mẹo sức khỏe</p>
            <p className="text-xs text-green-600 mb-3">
              Uống đủ 8 ly nước mỗi ngày để duy trì sức khỏe não bộ
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              Xem thêm mẹo
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default PatientSidebar; 