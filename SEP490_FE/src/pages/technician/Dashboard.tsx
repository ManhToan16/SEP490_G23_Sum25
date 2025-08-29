import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Calendar } from 'lucide-react';

const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Lịch xét nghiệm',
      description: 'Xem và quản lý xét nghiệm',
      path: ROUTES.TECHNICIAN.TEST_SCHEDULE,
      color: 'bg-clinic-navy',
    },
    {
      title: 'Lịch làm việc',
      description: 'Xem và cập nhật lịch làm việc',
      path: ROUTES.MY_SCHEDULE,
      color: 'bg-clinic-navy',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Kỹ thuật viên</h1>
        <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và lịch xét nghiệm</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action) => (
          <Card
            key={action.title}
            onClick={() => navigate(action.path)}
            className="cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <CardContent className="p-6">
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                <Calendar className="text-white w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-clinic-navy mb-1">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TechnicianDashboard; 