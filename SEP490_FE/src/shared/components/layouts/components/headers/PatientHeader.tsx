import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Bell, Calendar, User, LogOut, ChevronDown, Settings, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';

const PatientHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-clinic-blue/20 px-6 py-4 h-16">
      <div className="flex items-center justify-between h-full">
        {/* Logo và tiêu đề */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-clinic-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NK</span>
            </div>
            <h1 className="text-xl font-poppins font-semibold text-clinic-navy">
              Phòng Khám Nội Thần Kinh
            </h1>
          </div>
        </div>

        {/* Actions bên phải */}
        <div className="flex items-center space-x-3">
          {/* Quick booking button */}
          <Button 
            onClick={() => navigate('/patient/book-appointment')}
            className="bg-clinic-blue hover:bg-clinic-blue/90 text-white px-4 py-2"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Đặt lịch khám
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-clinic-navy" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback className="bg-clinic-blue text-white">BN</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-clinic-navy">Bệnh nhân</p>
                  <p className="text-xs text-gray-500">Nguyễn Văn A</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/patient/my-info')}>
                <User className="w-4 h-4 mr-2" />
                Thông tin cá nhân
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/auth/login')}>
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader; 