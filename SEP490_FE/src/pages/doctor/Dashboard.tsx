import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  FileText,
  Clock,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/shared/hooks/business/useAuth";
import { ROUTES } from "@/shared/constants/routes";

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const todayStats: Array<{
    label: string;
    value?: string | number;
    icon: any;
    color: string;
  }> = [
    {
      label: "Bệnh nhân hôm nay",
      icon: Users,
      color: "bg-clinic-blue",
    },
    {
      label: "Đã khám xong",
      icon: Activity,
      color: "bg-clinic-green",
    },
    { label: "Đang chờ", icon: Clock, color: "bg-orange-500" },
    {
      label: "Hồ sơ tạo mới",
      icon: FileText,
      color: "bg-clinic-navy",
    },
  ];

  const upcomingAppointments: any[] = [];

  const quickActions = [
    {
      icon: Users,
      title: "Hàng chờ khám",
      description: "Xem danh sách bệnh nhân chờ khám",
      path: ROUTES.DOCTOR.APPOINTMENT_QUEUE,
      color: "bg-clinic-blue",
    },
    {
      icon: FileText,
      title: "Hồ sơ chuyên môn",
      description: "Xem và cập nhật hồ sơ chuyên môn",
      path: ROUTES.DOCTOR.PROFILE,
      color: "bg-clinic-green",
    },
    {
      icon: Calendar,
      title: "Lịch làm việc",
      description: "Xem và cập nhật lịch làm việc",
      path: ROUTES.MY_SCHEDULE,
      color: "bg-clinic-navy",
    },
  ];

  return (
    <div className="p-6 md:p-10 lg:px-12 lg:py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Chào mừng, Bác sĩ {user?.unique_name || "Người dùng"}!
        </h1>
        <p className="text-gray-600">
          Hôm nay là {new Date().toLocaleDateString("vi-VN")}
          {upcomingAppointments.length > 0 && (
            <> - Có {upcomingAppointments.length} lịch hẹn sắp tới</>
          )}
        </p>
      </div>

      {/* Removed top stats per request */}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <div
            key={index}
            onClick={() => navigate(action.path)}
            className="clinic-card cursor-pointer hover:scale-105 transform transition-all"
          >
            <div
              className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}
            >
              <action.icon className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-poppins font-semibold text-clinic-navy mb-2">
              {action.title}
            </h3>
            <p className="text-gray-600">{action.description}</p>
          </div>
        ))}
      </div>

      {/* Removed Upcoming Appointments and summaries per request */}
    </div>
  );
};

export default DoctorDashboard;
