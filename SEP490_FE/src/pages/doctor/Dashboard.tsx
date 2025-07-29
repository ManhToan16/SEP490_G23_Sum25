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

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const todayStats = [
    {
      label: "Bệnh nhân hôm nay",
      value: "12",
      icon: Users,
      color: "bg-clinic-blue",
    },
    {
      label: "Đã khám xong",
      value: "8",
      icon: Activity,
      color: "bg-clinic-green",
    },
    { label: "Đang chờ", value: "4", icon: Clock, color: "bg-orange-500" },
    {
      label: "Hồ sơ tạo mới",
      value: "6",
      icon: FileText,
      color: "bg-clinic-navy",
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      time: "14:00",
      patient: "Nguyễn Văn A",
      age: 35,
      reason: "Đau đầu mãn tính",
      type: "Tái khám",
    },
    {
      id: 2,
      time: "14:30",
      patient: "Trần Thị B",
      age: 42,
      reason: "Rối loạn giấc ngủ",
      type: "Khám lần đầu",
    },
    {
      id: 3,
      time: "15:00",
      patient: "Lê Văn C",
      age: 28,
      reason: "Stress, lo âu",
      type: "Tư vấn",
    },
  ];

  const quickActions = [
    {
      icon: Users,
      title: "Hàng chờ khám",
      description: "Xem danh sách bệnh nhân chờ khám",
      path: "/doctor/queue",
      color: "bg-clinic-blue",
    },
    {
      icon: FileText,
      title: "Tạo hồ sơ bệnh án",
      description: "Tạo phiếu khám và hồ sơ mới",
      path: "/doctor/create-record",
      color: "bg-clinic-green",
    },
    {
      icon: Calendar,
      title: "Lịch làm việc",
      description: "Xem và cập nhật lịch làm việc",
      path: "/doctor/schedule",
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
          Hôm nay là {new Date().toLocaleDateString("vi-VN")} - Có{" "}
          {upcomingAppointments.length} lịch hẹn sắp tới
        </p>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {todayStats.map((stat, index) => (
          <div key={index} className="clinic-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-clinic-navy">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

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

      {/* Upcoming Appointments */}
      <div className="clinic-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy">
            Lịch hẹn tiếp theo
          </h2>
          <button
            onClick={() => navigate("/doctor/queue")}
            className="clinic-button-secondary"
          >
            Xem hàng chờ
          </button>
        </div>

        <div className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-clinic-blue rounded-lg flex items-center justify-center">
                  <Clock className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-clinic-navy">
                    {appointment.time} - {appointment.patient} (
                    {appointment.age} tuổi)
                  </h4>
                  <p className="text-gray-600">{appointment.reason}</p>
                  <span className="text-sm text-gray-500">
                    {appointment.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <button className="px-4 py-2 clinic-button-primary">
                  Bắt đầu khám
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="clinic-card">
          <h3 className="text-lg font-poppins font-semibold text-clinic-navy mb-4">
            Thống kê tuần này
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng bệnh nhân khám</span>
              <span className="font-medium text-clinic-navy">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hồ sơ mới tạo</span>
              <span className="font-medium text-clinic-navy">28</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Đơn thuốc kê</span>
              <span className="font-medium text-clinic-navy">32</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Giờ làm việc</span>
              <span className="font-medium text-clinic-navy">38h</span>
            </div>
          </div>
        </div>

        <div className="clinic-card">
          <h3 className="text-lg font-poppins font-semibold text-clinic-navy mb-4">
            Lịch làm việc tuần tới
          </h3>
          <div className="space-y-2">
            {["Thứ 2", "Thứ 4", "Thứ 6"].map((day, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span className="text-gray-700">{day}</span>
                <span className="text-sm text-clinic-navy">08:00 - 17:00</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
