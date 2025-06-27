import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  UserPlus,
  ClipboardList,
  Phone,
  AlertCircle,
} from "lucide-react";

const ReceptionistDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: UserPlus,
      title: "Tạo bệnh nhân mới",
      description: "Đăng ký thông tin bệnh nhân mới",
      path: "/receptionist/create-patient",
      color: "bg-clinic-blue",
    },
    {
      icon: ClipboardList,
      title: "Tạo lịch hẹn",
      description: "Đặt lịch hẹn cho bệnh nhân",
      path: "/receptionist/create-appointment",
      color: "bg-clinic-green",
    },
    {
      icon: Users,
      title: "Danh sách bệnh nhân",
      description: "Quản lý thông tin bệnh nhân",
      path: "/receptionist/list",
      color: "bg-clinic-navy",
    },
    {
      icon: Calendar,
      title: "Lịch hẹn hôm nay",
      description: "Xem và quản lý lịch hẹn",
      path: "/receptionist/appointments",
      color: "bg-purple-500",
    },
  ];

  const todayStats = [
    { label: "Tổng lịch hẹn", value: "24", change: "+3" },
    { label: "Đã hoàn thành", value: "18", change: "+2" },
    { label: "Đang chờ", value: "4", change: "0" },
    { label: "Đã hủy", value: "2", change: "+1" },
  ];

  const recentAppointments = [
    {
      id: 1,
      time: "09:00",
      patient: "Nguyễn Văn A",
      doctor: "BS. Trần Thị B",
      status: "Đang khám",
      room: "Phòng 1",
    },
    {
      id: 2,
      time: "09:30",
      patient: "Lê Thị C",
      doctor: "BS. Phạm Văn D",
      status: "Chờ khám",
      room: "Phòng 2",
    },
    {
      id: 3,
      time: "10:00",
      patient: "Hoàng Văn E",
      doctor: "BS. Trần Thị B",
      status: "Chờ khám",
      room: "Phòng 1",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Bảng điều khiển lễ tân
        </h1>
        <p className="text-gray-600">Quản lý bệnh nhân và lịch hẹn hôm nay</p>
      </div>

      {/* Stats Cards */}
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
              <div className="text-right">
                <span
                  className={`text-sm ${
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : stat.change === "0"
                      ? "text-gray-500"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-gray-600 text-sm">{action.description}</p>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="clinic-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy">
            Lịch hẹn hôm nay
          </h2>
          <button
            onClick={() => navigate("/receptionist/appointments")}
            className="clinic-button-secondary"
          >
            Xem tất cả
          </button>
        </div>

        <div className="space-y-3">
          {recentAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-clinic-blue rounded-lg flex items-center justify-center">
                  <Calendar className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-clinic-navy">
                    {appointment.time} - {appointment.patient}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {appointment.doctor} - {appointment.room}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    appointment.status === "Đang khám"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="clinic-card bg-red-50 border-red-200">
        <div className="flex items-center space-x-4 text-red-700">
          <AlertCircle size={24} />
          <div>
            <h3 className="font-medium">Liên hệ khẩn cấp</h3>
            <p className="text-sm">Hotline: (028) 1234 5678 - Ext: 999</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
