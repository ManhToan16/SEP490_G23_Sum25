import React, { useState, useEffect } from "react";
import { adminService } from "@/shared/services/adminService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartData {
  revenueData: Array<{
    date: string;
    revenue: number;
  }>;
  appointmentData: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  staffData: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
}

const DashboardCharts: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const [revenueRes, appointmentRes, staffRes] = await Promise.all([
        adminService.getRevenueStatistics(),
        adminService.getAppointmentStatistics(),
        adminService.getStaffStatistics(),
      ]);

      setChartData({
        revenueData: revenueRes.dailyRevenues || [],
        appointmentData: appointmentRes.appointmentsByStatus || [],
        staffData: staffRes.staffByRole || [],
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      // Fallback to mock data
      setChartData({
        revenueData: [
          { date: "2024-01-15", revenue: 250000 },
          { date: "2024-01-16", revenue: 300000 },
          { date: "2024-01-17", revenue: 280000 },
        ],
        appointmentData: [
          { status: "Chờ xác nhận", count: 8, percentage: 17.8 },
          { status: "Hoàn thành", count: 32, percentage: 71.1 },
          { status: "Đã hủy", count: 5, percentage: 11.1 },
        ],
        staffData: [
          { role: "Bác sĩ", count: 8, percentage: 29.6 },
          { role: "Y tá", count: 12, percentage: 44.4 },
          { role: "Kỹ thuật viên", count: 4, percentage: 14.8 },
          { role: "Lễ tân", count: 3, percentage: 11.1 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinic-blue"></div>
      </div>
    );
  }

  if (!chartData) {
    return <div>Không có dữ liệu biểu đồ</div>;
  }

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="clinic-card">
        <h3 className="text-lg font-semibold text-clinic-navy mb-4">
          Biểu đồ doanh thu theo ngày
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
              labelFormatter={(label) => `Ngày: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              strokeWidth={2}
              name="Doanh thu"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Chart */}
        <div className="clinic-card">
          <h3 className="text-lg font-semibold text-clinic-navy mb-4">
            Phân bố lịch hẹn theo trạng thái
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.appointmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.appointmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, "Số lượng"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Staff Distribution Chart */}
        <div className="clinic-card">
          <h3 className="text-lg font-semibold text-clinic-navy mb-4">
            Phân bố nhân viên theo vai trò
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.staffData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip formatter={(value: number) => [value, "Số lượng"]} />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Số lượng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
