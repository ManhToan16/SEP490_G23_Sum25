import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/shared/utils';
import { NAVIGATION_ITEMS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

function isMenuGroup(item: any): item is { label: string; icon: string; children: any[] } {
  return Array.isArray(item.children);
}

const DoctorSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const menuItems = NAVIGATION_ITEMS.DOCTOR;

  const isActive = (path: string) => location.pathname === path;
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };
  const handleToggle = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#2C3E50] rounded-lg flex items-center justify-center">
            {getIcon('Stethoscope')}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Khu vực Bác sĩ</h3>
            <p className="text-sm text-gray-600">Chuyên khoa Nội thần kinh</p>
          </div>
        </div>
      </div>
      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item: any, index: number) => {
          if (isMenuGroup(item)) {
            const isOpen = openMenus.includes(item.label);
            return (
              <div key={item.label}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-lg text-left',
                    isOpen ? 'bg-[#2C3E50] text-white' : 'text-gray-700 hover:bg-gray-100'
                  )}
                  onClick={() => handleToggle(item.label)}
                >
                  <span className="flex items-center">
                    {getIcon(item.icon)}
                    <span className="ml-3 font-medium">{item.label}</span>
                  </span>
                  <LucideIcons.ChevronDown className={cn('ml-2 transition-transform', isOpen ? 'rotate-180' : '')} />
                </Button>
                {isOpen && (
                  <div className="pl-8 space-y-1 mt-1">
                    {item.children.map((child: any) => (
                      <Button
                        key={child.path}
                        variant={isActive(child.path) ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start text-sm',
                          isActive(child.path)
                            ? 'bg-[#2C3E50] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                        onClick={() => navigate(child.path)}
                      >
                        {getIcon(child.icon)}
                        <span className="ml-2">{child.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          if (item.path) {
            return (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start text-left',
                  isActive(item.path)
                    ? 'bg-[#2C3E50] text-white hover:bg-[#34495E]'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center space-x-3">
                  {getIcon(item.icon)}
                  <span>{item.label}</span>
                </div>
              </Button>
            );
          }
          return null;
        })}
      </nav>
      {/* Quick Stats */}
      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Lịch hôm nay</span>
            <Badge variant="outline">8 bệnh nhân</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Đang chờ</span>
            <Badge variant="secondary">3 người</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Đánh giá TB</span>
            <Badge variant="default" className="bg-yellow-500">4.8 ⭐</Badge>
          </div>
        </div>
      </div>
      {/* Emergency Contact */}
      <div className="p-4 bg-red-50 border-t border-red-100">
        <div className="text-center">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <p className="text-sm font-medium text-red-800">Khẩn cấp</p>
          <p className="text-xs text-red-600">Nhấn để báo cáo sự cố</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorSidebar; 