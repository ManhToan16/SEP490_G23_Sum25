import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Users, Package, Calendar, TestTube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

const NurseDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Users,
      title: 'Bệnh nhân tổng quát',
      description: 'Xem danh sách bệnh nhân tổng quát',
      path: ROUTES.NURSE.PATIENT_QUEUE,
      color: 'bg-clinic-blue',
    },
    {
      icon: TestTube,
      title: 'Bệnh nhân xét nghiệm',
      description: 'Xem danh sách bệnh nhân xét nghiệm',
      path: ROUTES.NURSE.LAB_PATIENT_QUEUE,
      color: 'bg-green-600',
    },
    {
      icon: Package,
      title: 'Quản lý vật tư trong phòng',
      description: 'Quản lý vật tư và tồn kho trong phòng',
      path: ROUTES.NURSE.SUPPLY_MANAGEMENT,
      color: 'bg-indigo-600',
    },
    {
      icon: Calendar,
      title: 'Lịch làm việc',
      description: 'Xem và cập nhật lịch làm việc',
      path: ROUTES.MY_SCHEDULE,
      color: 'bg-clinic-navy',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Y tá</h1>
        <p className="text-gray-600 mt-2">Quản lý hàng chờ bệnh nhân và vật tư phòng khám</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            onClick={() => navigate(action.path)}
            className="cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <CardContent className="p-6">
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                <action.icon className="text-white w-6 h-6" />
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

export default NurseDashboard; 