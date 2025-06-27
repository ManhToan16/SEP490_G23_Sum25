import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building,
  Activity,
  TrendingUp,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const systemStats = [
    {
      label: "Tổng người dùng",
      value: "156",
      change: "+12",
      icon: Users,
      color: "bg-clinic-blue",
    },
    {
      label: "Bác sĩ hoạt động",
      value: "8",
      change: "+1",
      icon: Activity,
      color: "bg-clinic-green",
    },
    {
      label: "Phòng khám",
      value: "6",
      change: "0",
      icon: Building,
      color: "bg-clinic-navy",
    },
    {
      label: "Doanh thu tháng",
      value: "125M",
      change: "+8%",
      icon: DollarSign,
      color: "bg-purple-500",
    },
  ];

  const quickActions = [
    {
      icon: Users,
      title: "Quản lý tài khoản",
      description: "Tạo và quản lý tài khoản người dùng",
      path: "/admin/accounts",
      color: "bg-clinic-blue",
    },
    {
      icon: Building,
      title: "Quản lý phòng khám",
      description: "Cấu hình phòng ban, dịch vụ, phòng khám",
      path: "/admin/clinic",
      color: "bg-clinic-green",
    },
    {
      icon: Activity,
      title: "Nhật ký hệ thống",
      description: "Theo dõi hoạt động và bảo mật",
      path: "/admin/logs",
      color: "bg-clinic-navy",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "CREATE_USER",
      user: "Admin",
      action: "Tạo tài khoản bác sĩ mới: BS. Nguyễn Văn X",
      time: "10 phút trước",
    },
    {
      id: 2,
      type: "UPDATE_SYSTEM",
      user: "System",
      action: "Cập nhật cấu hình hệ thống",
      time: "1 giờ trước",
    },
    {
      id: 3,
      type: "LOGIN",
      user: "BS. Trần Thị B",
      action: "Đăng nhập vào hệ thống",
      time: "2 giờ trước",
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      level: "warning",
      message: "Dung lượng ổ cứng sắp đầy (85%)",
      time: "30 phút trước",
    },
    {
      id: 2,
      level: "info",
      message: "Backup dữ liệu hoàn thành",
      time: "2 giờ trước",
    },
  ];

  const getAlertColor = (level: string) => {
    switch (level) {
      case "warning":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Bảng điều khiển quản trị
        </h1>
        <p className="text-gray-600">
          Tổng quan hệ thống và hoạt động phòng khám
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {systemStats.map((stat, index) => (
          <div key={index} className="clinic-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-clinic-navy">
                  {stat.value}
                </p>
                <p
                  className={`text-sm ${
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="clinic-card">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
            Hoạt động gần đây
          </h2>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-clinic-blue rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-clinic-navy font-medium">
                    {activity.action}
                  </p>
                  <p className="text-gray-600 text-sm">bởi {activity.user}</p>
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/admin/logs")}
            className="w-full mt-4 clinic-button-secondary"
          >
            Xem tất cả nhật ký
          </button>
        </div>

        {/* System Alerts */}
        <div className="clinic-card">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
            Cảnh báo hệ thống
          </h2>

          <div className="space-y-3">
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 border rounded-lg ${getAlertColor(
                  alert.level
                )}`}
              >
                <div className="flex items-start space-x-2">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs opacity-75">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {systemAlerts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Không có cảnh báo nào</p>
            </div>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Tình trạng hệ thống
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <h3 className="font-medium text-clinic-navy">Server</h3>
            <p className="text-green-600 text-sm">Hoạt động bình thường</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <h3 className="font-medium text-clinic-navy">Database</h3>
            <p className="text-green-600 text-sm">Kết nối ổn định</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
            </div>
            <h3 className="font-medium text-clinic-navy">Storage</h3>
            <p className="text-orange-600 text-sm">85% đã sử dụng</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <h3 className="font-medium text-clinic-navy">Backup</h3>
            <p className="text-green-600 text-sm">Hoàn thành 2h trước</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
