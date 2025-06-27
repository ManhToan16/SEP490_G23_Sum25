import React from "react";
import { useAuth } from "@/shared/hooks/business/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Calendar,
  Clock,
  FileText,
  Star,
  User,
  Heart,
  AlertCircle,
} from "lucide-react";

interface QuickStat {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}

interface UpcomingAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: "consultation" | "follow-up" | "emergency";
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data - should come from API
  const quickStats: QuickStat[] = [
    {
      title: "Lịch hẹn sắp tới",
      value: "2",
      icon: <Calendar className="h-5 w-5 text-blue-600" />,
    },
    {
      title: "Hồ sơ bệnh án",
      value: "8",
      icon: <FileText className="h-5 w-5 text-green-600" />,
    },
    {
      title: "Đánh giá đã cho",
      value: "5",
      icon: <Star className="h-5 w-5 text-orange-600" />,
    },
    {
      title: "Chỉ số sức khỏe",
      value: "Tốt",
      icon: <Heart className="h-5 w-5 text-red-600" />,
    },
  ];

  const upcomingAppointments: UpcomingAppointment[] = [
    {
      id: "1",
      doctorName: "BS. Nguyễn Văn A",
      specialty: "Thần kinh",
      date: "2024-01-15",
      time: "09:00",
      type: "consultation",
    },
    {
      id: "2",
      doctorName: "BS. Trần Thị B",
      specialty: "Tâm lý",
      date: "2024-01-20",
      time: "14:30",
      type: "follow-up",
    },
  ];

  const getAppointmentTypeColor = (type: UpcomingAppointment["type"]) => {
    switch (type) {
      case "emergency":
        return "bg-red-100 text-red-800";
      case "follow-up":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getAppointmentTypeLabel = (type: UpcomingAppointment["type"]) => {
    switch (type) {
      case "emergency":
        return "Khẩn cấp";
      case "follow-up":
        return "Tái khám";
      default:
        return "Khám mới";
    }
  };

  return (
    <div className="clinic-container clinic-section">
      {/* Welcome Header */}
      <div className="clinic-header">
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng, {user?.name || "Bệnh nhân"}!
        </h1>
        <p className="text-gray-600 mt-2">
          Tổng quan về tình trạng sức khỏe và lịch hẹn của bạn
        </p>
      </div>

      {/* Quick Stats */}
      <div className="clinic-grid-responsive">
        {quickStats.map((stat, index) => (
          <Card key={index} className="clinic-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              {stat.trend && (
                <p className="text-xs text-gray-600 mt-1">{stat.trend}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="clinic-card">
          <CardHeader>
            <CardTitle className="clinic-flex-between">
              <span>Lịch hẹn sắp tới</span>
              <Button variant="outline" size="sm">
                Xem tất cả
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="clinic-flex-center w-10 h-10 bg-blue-100 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.doctorName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.specialty}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {appointment.date} - {appointment.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={getAppointmentTypeColor(appointment.type)}
                    >
                      {getAppointmentTypeLabel(appointment.type)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Không có lịch hẹn sắp tới</p>
                <Button className="clinic-button-primary mt-4">
                  Đặt lịch khám
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Tips */}
        <Card className="clinic-card">
          <CardHeader>
            <CardTitle className="clinic-flex-between">
              <span>Lời khuyên sức khỏe</span>
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Chế độ nghỉ ngơi
                </h4>
                <p className="text-sm text-blue-800">
                  Đảm bảo ngủ đủ 7-8 tiếng mỗi ngày để phục hồi hệ thần kinh.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Hoạt động thể chất
                </h4>
                <p className="text-sm text-green-800">
                  Tập thể dục nhẹ nhàng 30 phút/ngày giúp cải thiện tuần hoàn
                  não.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Chế độ ăn uống
                </h4>
                <p className="text-sm text-blue-800">
                  Ăn nhiều rau xanh, trái cây và hạn chế thức ăn nhiều dầu mỡ.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="clinic-card">
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="clinic-button-primary h-auto py-4 flex-col space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Đặt lịch khám</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col space-y-2"
            >
              <FileText className="h-6 w-6" />
              <span>Xem hồ sơ</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col space-y-2"
            >
              <Star className="h-6 w-6" />
              <span>Đánh giá BS</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col space-y-2"
            >
              <User className="h-6 w-6" />
              <span>Cập nhật TT</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;
