import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils';
import { NAVIGATION_ITEMS } from '@/shared/constants/routes';

function isMenuGroup(item: any): item is { label: string; icon: string; children: any[] } {
  return Array.isArray(item.children);
}

const PatientSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const menuItems = NAVIGATION_ITEMS.PATIENT;

  const isActive = (path: string) => location.pathname === path;
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5 mr-3" /> : null;
  };
  const handleToggle = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <aside className="w-72 bg-clinic-blue/5 border-r border-clinic-blue/10 p-4 space-y-4">
      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item: any) => {
          if (isMenuGroup(item)) {
            const isOpen = openMenus.includes(item.label);
            return (
              <div key={item.label}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left',
                    isOpen ? 'bg-clinic-blue text-white' : 'text-clinic-navy hover:bg-clinic-blue/10'
                  )}
                  onClick={() => handleToggle(item.label)}
                >
                  <span className="flex items-center">
                    {getIcon(item.icon)}
                    <span className="ml-2 font-medium">{item.label}</span>
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
                            ? 'bg-clinic-blue text-white'
                            : 'text-clinic-navy hover:bg-clinic-blue/10'
                        )}
                        onClick={() => navigate(child.path)}
                      >
                        {getIcon(child.icon)}
                        <span className="ml-2">{child.label}</span>
                        {child.badge && (
                          <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                            {child.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          if (item.path) {
            const Icon = (LucideIcons as any)[item.icon];
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
                {getIcon(item.icon)}
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          }
          return null;
        })}
      </nav>
      {/* Upcoming Appointment Widget */}
      <Card className="border-clinic-blue/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-clinic-navy flex items-center">
            <LucideIcons.Clock className="w-4 h-4 mr-2" />
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
              <LucideIcons.ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Emergency Contact */}
      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <LucideIcons.Phone className="w-5 h-5 text-red-600" />
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
            <LucideIcons.Phone className="w-3 h-3 mr-2" />
            Gọi ngay
          </Button>
        </CardContent>
      </Card>
      {/* Quick Tips */}
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <LucideIcons.Star className="w-4 h-4 text-green-600" />
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