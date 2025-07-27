import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ROUTES } from '@/shared/constants/routes';

const TestNavigation: React.FC = () => {
  const navigate = useNavigate();

  const testRoutes = [
    { path: ROUTES.DOCTOR.DASHBOARD, label: 'Dashboard', color: 'bg-blue-500' },
    { path: ROUTES.DOCTOR.MY_INFO, label: 'Thông tin cá nhân (My Info)', color: 'bg-green-500' },
    { path: ROUTES.DOCTOR.PROFILE, label: 'Hồ sơ chuyên môn (Profile)', color: 'bg-purple-500' },
    { path: ROUTES.MY_SCHEDULE, label: 'Lịch làm việc', color: 'bg-orange-500' },
    { path: ROUTES.DOCTOR.APPOINTMENT_QUEUE, label: 'Hàng chờ khám', color: 'bg-red-500' },
  ];

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-clinic-navy">
            🧪 Test Navigation Routes
          </CardTitle>
          <p className="text-gray-600">
            Click vào các button để test navigation đến các route khác nhau
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testRoutes.map((route) => (
              <Button
                key={route.path}
                onClick={() => navigate(route.path)}
                className={`${route.color} hover:opacity-90 text-white h-auto p-4 flex flex-col items-start space-y-2`}
              >
                <span className="font-semibold">{route.label}</span>
                <span className="text-xs opacity-80">{route.path}</span>
              </Button>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">📋 Lưu ý:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Route <code>/doctor/my-info</code> và <code>/doctor/profile</code> đều hiển thị cùng component MyInfo</li>
              <li>• Component MyInfo đã được cập nhật để handle Doctor Profile API</li>
              <li>• Navigation sidebar sẽ có 2 items riêng biệt cho "Thông tin cá nhân" và "Hồ sơ chuyên môn"</li>
              <li>• API endpoint: <code>http://70.153.24.53:5050/api/Doctor/Profiles</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestNavigation; 