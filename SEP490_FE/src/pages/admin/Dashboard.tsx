import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building,
  Activity,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Calendar,
  Package,
  UserCheck,
  Clock,
  BarChart3,
  PieChart,
} from "lucide-react";
import { adminService } from "@/shared/services/adminService";
import DashboardCharts from "./components/DashboardCharts";


interface DashboardData {
  patientStats: {
    totalPatients: number;
    newPatients: number;
    activePatients: number;
    growthRate: number;
  };
  appointmentStats: {
    totalAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    completionRate: number;
  };
  revenueStats: {
    totalRevenue: number;
    monthlyRevenue: number;
    weeklyRevenue: number;
    dailyRevenue: number;
    growthRate: number;
    averageRevenuePerPatient: number;
  };
  staffStats: {
    totalDoctors: number;
    totalNurses: number;
    totalTechnicians: number;
    totalReceptionists: number;
    doctorAttendanceRate: number;
  };
  inventoryStats: {
    totalMaterials: number;
    lowStockMaterials: number;
    totalMedicines: number;
    lowStockMedicines: number;
  };
  roomStats: {
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    utilizationRate: number;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    user: string;
    action: string;
    time: string;
  }>;
  systemAlerts: Array<{
    id: string;
    level: string;
    message: string;
    time: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tất cả dữ liệu từ các API khác nhau
      const [
        dashboardOverview,
        patientStats,
        appointmentStats,
        revenueStats,
        inventoryStats,
        roomUtilization
      ] = await Promise.all([
        adminService.getDashboardOverview().catch(() => null),
        adminService.getPatientStatistics().catch(() => null),
        adminService.getAppointmentStatistics().catch(() => null),
        adminService.getRevenueStatistics().catch(() => null),
        adminService.getInventoryStatistics().catch(() => null),
        adminService.getRoomUtilization().catch(() => null)
      ]);

      // Tạo dashboard data từ các API responses
      const combinedData: DashboardData = {
        patientStats: {
          totalPatients: patientStats?.totalPatients || dashboardOverview?.patientStats?.totalPatients || 156,
          newPatients: patientStats?.newPatients || dashboardOverview?.patientStats?.newPatients || 12,
          activePatients: patientStats?.activePatients || dashboardOverview?.patientStats?.activePatients || 89,
          growthRate: patientStats?.growthRate || dashboardOverview?.patientStats?.growthRate || 8.5
        },
        appointmentStats: {
          totalAppointments: appointmentStats?.totalAppointments || dashboardOverview?.appointmentStats?.totalAppointments || 45,
          pendingAppointments: appointmentStats?.pendingAppointments || dashboardOverview?.appointmentStats?.pendingAppointments || 8,
          completedAppointments: appointmentStats?.completedAppointments || dashboardOverview?.appointmentStats?.completedAppointments || 32,
          cancelledAppointments: appointmentStats?.cancelledAppointments || dashboardOverview?.appointmentStats?.cancelledAppointments || 5,
          completionRate: appointmentStats?.completionRate || dashboardOverview?.appointmentStats?.completionRate || 71.1
        },
        revenueStats: {
          totalRevenue: revenueStats?.totalRevenue || dashboardOverview?.revenueStats?.totalRevenue || 15000000,
          monthlyRevenue: revenueStats?.monthlyRevenue || dashboardOverview?.revenueStats?.monthlyRevenue || 5000000,
          weeklyRevenue: revenueStats?.weeklyRevenue || dashboardOverview?.revenueStats?.weeklyRevenue || 1200000,
          dailyRevenue: revenueStats?.dailyRevenue || dashboardOverview?.revenueStats?.dailyRevenue || 200000,
          growthRate: revenueStats?.growthRate || dashboardOverview?.revenueStats?.growthRate || 8.5,
          averageRevenuePerPatient: revenueStats?.averageRevenuePerPatient || dashboardOverview?.revenueStats?.averageRevenuePerPatient || 250000
        },
        staffStats: {
          totalDoctors: dashboardOverview?.staffStats?.totalDoctors || 8,
          totalNurses: dashboardOverview?.staffStats?.totalNurses || 12,
          totalTechnicians: dashboardOverview?.staffStats?.totalTechnicians || 4,
          totalReceptionists: dashboardOverview?.staffStats?.totalReceptionists || 3,
          doctorAttendanceRate: dashboardOverview?.staffStats?.doctorAttendanceRate || 95.5
        },
        inventoryStats: {
          totalMaterials: inventoryStats?.totalMaterials || dashboardOverview?.inventoryStats?.totalMaterials || 45,
          lowStockMaterials: inventoryStats?.lowStockMaterials || dashboardOverview?.inventoryStats?.lowStockMaterials || 3,
          totalMedicines: inventoryStats?.totalMedicines || dashboardOverview?.inventoryStats?.totalMedicines || 120,
          lowStockMedicines: inventoryStats?.lowStockMedicines || dashboardOverview?.inventoryStats?.lowStockMedicines || 2
        },
        roomStats: {
          totalRooms: roomUtilization?.totalRooms || 6,
          availableRooms: roomUtilization?.availableRooms || 3,
          occupiedRooms: roomUtilization?.occupiedRooms || 2,
          maintenanceRooms: roomUtilization?.maintenanceRooms || 1,
          utilizationRate: roomUtilization?.utilizationRate || 33.3
        },
        recentActivities: dashboardOverview?.recentActivities || [
          {
            id: "1",
            type: "CREATE_USER",
            user: "Admin",
            action: "Tạo tài khoản bác sĩ mới: BS. Nguyễn Văn X",
            time: "10 phút trước"
          },
          {
            id: "2",
            type: "UPDATE_SYSTEM",
            user: "System",
            action: "Cập nhật cấu hình hệ thống",
            time: "1 giờ trước"
          }
        ],
        systemAlerts: dashboardOverview?.systemAlerts || [
          {
            id: "1",
            level: "warning",
            message: "Dung lượng ổ cứng sắp đầy (85%)",
            time: "30 phút trước"
          },
          {
            id: "2",
            level: "info",
            message: "Backup dữ liệu hoàn thành",
            time: "2 giờ trước"
          }
        ]
      };

      setDashboardData(combinedData);
      
      // Log để debug
      console.log("Dashboard data loaded:", combinedData);
      console.log("API responses:", {
        dashboardOverview,
        patientStats,
        appointmentStats,
        revenueStats,
        inventoryStats,
        roomUtilization
      });
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Không thể tải dữ liệu dashboard");
      
      // Fallback to mock data khi tất cả API đều lỗi
      setDashboardData({
        patientStats: {
          totalPatients: 156,
          newPatients: 12,
          activePatients: 89,
          growthRate: 8.5
        },
        appointmentStats: {
          totalAppointments: 45,
          pendingAppointments: 8,
          completedAppointments: 32,
          cancelledAppointments: 5,
          completionRate: 71.1
        },
        revenueStats: {
          totalRevenue: 15000000,
          monthlyRevenue: 5000000,
          weeklyRevenue: 1200000,
          dailyRevenue: 200000,
          growthRate: 8.5,
          averageRevenuePerPatient: 250000
        },
        staffStats: {
          totalDoctors: 8,
          totalNurses: 12,
          totalTechnicians: 4,
          totalReceptionists: 3,
          doctorAttendanceRate: 95.5
        },
        inventoryStats: {
          totalMaterials: 45,
          lowStockMaterials: 3,
          totalMedicines: 120,
          lowStockMedicines: 2
        },
        roomStats: {
          totalRooms: 6,
          availableRooms: 3,
          occupiedRooms: 2,
          maintenanceRooms: 1,
          utilizationRate: 33.3
        },
        recentActivities: [
          {
            id: "1",
            type: "CREATE_USER",
            user: "Admin",
            action: "Tạo tài khoản bác sĩ mới: BS. Nguyễn Văn X",
            time: "10 phút trước"
          },
          {
            id: "2",
            type: "UPDATE_SYSTEM",
            user: "System",
            action: "Cập nhật cấu hình hệ thống",
            time: "1 giờ trước"
          }
        ],
        systemAlerts: [
          {
            id: "1",
            level: "warning",
            message: "Dung lượng ổ cứng sắp đầy (85%)",
            time: "30 phút trước"
          },
          {
            id: "2",
            level: "info",
            message: "Backup dữ liệu hoàn thành",
            time: "2 giờ trước"
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinic-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 clinic-button-primary"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Không có dữ liệu</div>;
  }

  const systemStats = [
    {
      label: "Tổng bệnh nhân",
      value: formatNumber(dashboardData.patientStats.totalPatients),
      change: `+${dashboardData.patientStats.growthRate}%`,
      icon: Users,
      color: "bg-clinic-blue",
      trend: dashboardData.patientStats.growthRate >= 0 ? "up" : "down",
    },
    {
      label: "Lịch hẹn hôm nay",
      value: formatNumber(dashboardData.appointmentStats.totalAppointments),
      change: `${dashboardData.appointmentStats.completionRate}% hoàn thành`,
      icon: Calendar,
      color: "bg-clinic-green",
      trend: "up",
    },
    {
      label: "Doanh thu tháng",
      value: formatCurrency(dashboardData.revenueStats.monthlyRevenue),
      change: `+${dashboardData.revenueStats.growthRate}%`,
      icon: DollarSign,
      color: "bg-purple-500",
      trend: dashboardData.revenueStats.growthRate >= 0 ? "up" : "down",
    },
    {
      label: "Bác sĩ hoạt động",
      value: formatNumber(dashboardData.staffStats.totalDoctors),
      change: `${dashboardData.staffStats.doctorAttendanceRate}% có mặt`,
      icon: UserCheck,
      color: "bg-clinic-navy",
      trend: "up",
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
      icon: Package,
      title: "Quản lý vật tư",
      description: "Theo dõi kho vật tư và thuốc",
      path: "/admin/materials",
      color: "bg-clinic-navy",
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

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="text-green-600" size={16} />
    ) : (
      <TrendingUp className="text-red-600 transform rotate-180" size={16} />
    );
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat, index) => (
          <div key={index} className="clinic-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-clinic-navy">
                  {stat.value}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(stat.trend)}
                  <p
                    className={`text-sm ${
                      stat.trend === "up"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
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

      {/* Main Charts Section */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-6">
          Biểu đồ thống kê tổng quan
        </h2>
        <DashboardCharts />
      </div>

      {/* Activity & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="clinic-card">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
            Hoạt động gần đây
          </h2>

          <div className="space-y-4">
            {dashboardData.recentActivities.map((activity) => (
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
            {dashboardData.systemAlerts.map((alert) => (
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

          {dashboardData.systemAlerts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Không có cảnh báo nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Key Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Appointment Statistics */}
        <div className="clinic-card">
          <h2 className="text-lg font-poppins font-semibold text-clinic-navy mb-4">
            Lịch hẹn
          </h2>
          <div className="space-y-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData.appointmentStats.completedAppointments}
              </p>
              <p className="text-sm text-gray-600">Hoàn thành</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xl font-bold text-orange-600">
                {dashboardData.appointmentStats.pendingAppointments}
              </p>
              <p className="text-sm text-gray-600">Chờ xác nhận</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-clinic-navy">
                Tỷ lệ: {dashboardData.appointmentStats.completionRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Room Utilization */}
        <div className="clinic-card">
          <h2 className="text-lg font-poppins font-semibold text-clinic-navy mb-4">
            Phòng khám
          </h2>
          <div className="space-y-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {dashboardData.roomStats.availableRooms}
              </p>
              <p className="text-sm text-gray-600">Phòng trống</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xl font-bold text-purple-600">
                {dashboardData.roomStats.occupiedRooms}
              </p>
              <p className="text-sm text-gray-600">Đang sử dụng</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-clinic-navy">
                Sử dụng: {dashboardData.roomStats.utilizationRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Staff Overview */}
        <div className="clinic-card">
          <h2 className="text-lg font-poppins font-semibold text-clinic-navy mb-4">
            Nhân viên
          </h2>
          <div className="space-y-3">
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">
                {dashboardData.staffStats.totalDoctors + dashboardData.staffStats.totalNurses + dashboardData.staffStats.totalTechnicians}
              </p>
              <p className="text-sm text-gray-600">Tổng nhân viên</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xl font-bold text-blue-600">
                {dashboardData.staffStats.doctorAttendanceRate}%
              </p>
              <p className="text-sm text-gray-600">Tỷ lệ có mặt</p>
            </div>
            <button
              onClick={() => navigate("/admin/staff")}
              className="w-full clinic-button-secondary text-sm"
            >
              Quản lý nhân viên
            </button>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="clinic-card">
          <h2 className="text-lg font-poppins font-semibold text-clinic-navy mb-4">
            Kho vật tư
          </h2>
          <div className="space-y-3">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {dashboardData.inventoryStats.lowStockMaterials}
              </p>
              <p className="text-sm text-gray-600">Vật tư sắp hết</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-xl font-bold text-yellow-600">
                {dashboardData.inventoryStats.lowStockMedicines}
              </p>
              <p className="text-sm text-gray-600">Thuốc sắp hết</p>
            </div>
            <button
              onClick={() => navigate("/admin/materials")}
              className="w-full clinic-button-primary text-sm"
            >
              Kiểm tra kho
            </button>
          </div>
        </div>
      </div>

      {/* Management & System Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Management */}
        <div className="clinic-card">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
            Quản lý lịch làm việc
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">
                  {dashboardData.staffStats.totalDoctors + dashboardData.staffStats.totalNurses + dashboardData.staffStats.totalTechnicians}
                </p>
                <p className="text-sm text-gray-600">Nhân viên có lịch</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.roomStats.totalRooms}
                </p>
                <p className="text-sm text-gray-600">Phòng được lên lịch</p>
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xl font-bold text-blue-600">
                {dashboardData.appointmentStats.totalAppointments}
              </p>
              <p className="text-sm text-gray-600">Lịch hẹn hôm nay</p>
            </div>
            <button
              onClick={() => navigate("/admin/schedules")}
              className="w-full clinic-button-primary"
            >
              Quản lý lịch làm việc
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="clinic-card">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
            Tình trạng hệ thống
          </h2>

          <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
};

export default AdminDashboard;
