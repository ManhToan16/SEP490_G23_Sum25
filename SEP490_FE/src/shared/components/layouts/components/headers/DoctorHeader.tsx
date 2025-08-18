import React, { useEffect } from 'react';
import { Bell, Search, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import { useAuth } from '@/shared/hooks/business/useAuth';
import { useAppSelector, useAppDispatch } from '@/shared/store';
import { fetchDoctorProfile } from '@/shared/store/slices/doctorProfileSlice';
import { useNavigate } from 'react-router-dom';

const DoctorHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get doctor profile from store to access avatar
  const { profile } = useAppSelector((state) => state.doctorProfile);

  // Load doctor profile when component mounts
  useEffect(() => {
    if (user?.UserId && !profile) {
      dispatch(fetchDoctorProfile(user.UserId));
    }
  }, [dispatch, user?.UserId, profile]);

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  const handleUserProfile = () => {
    navigate('/doctor/user-profile');
  };

  // Helper function to get avatar URL
  const getAvatarUrl = () => {
    // Priority: doctor profile avatar > user avatar > null
    if (profile?.avatar) {
      return profile.avatar;
    }
    if (user?.avatar) {
      return user.avatar;
    }
    return null;
  };

  // Helper function to get display name
  const getDisplayName = () => {
    return profile?.name || user?.name || 'Bác sĩ';
  };

  // Helper function to get unique name
  const getUniqueName = () => {
    return user?.unique_name || '';
  };

  return (
    <div className="h-16 px-6 flex items-center justify-between bg-white border-b">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-4">
        <div className="font-bold text-xl text-[#2C3E50]">
          Phòng Khám Nội Thần Kinh
        </div>
        <Badge variant="secondary" className="text-xs">
          Bác sĩ
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm bệnh nhân, lịch hẹn..."
            className="pl-10 clinic-input"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            3
          </Badge>
        </Button>

        {/* Quick Actions */}
        <Button variant="ghost" size="sm">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={getAvatarUrl()} />
                <AvatarFallback>
                  {getDisplayName()?.substring(0, 2).toUpperCase() || 'BS'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">{getDisplayName()}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleUserProfile}>
              <User className="mr-2 h-4 w-4" />
              <span>Thông tin cá nhân</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Cài đặt</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DoctorHeader; 