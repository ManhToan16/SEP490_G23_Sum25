import React from "react";
import { Calendar, Clock, MapPin, DollarSign, User, Phone } from "lucide-react";

const MyAppointments: React.FC = () => {
  const appointments = [
    {
      id: 1,
      date: "2025-06-20",
      time: "09:00",
      doctor: "BS. Nguyễn Văn A",
      specialty: "Thần kinh học",
      room: "Phòng khám chính 1",
      status: "Đã xác nhận",
      type: "Khám tổng quát",
      note: "Tái khám sau điều trị",
    },
    {
      id: 2,
      date: "2025-06-25",
      time: "14:30",
      doctor: "BS. Trần Thị B",
      specialty: "Tâm thần học",
      room: "Phòng khám chính 2",
      status: "Chờ xác nhận",
      type: "Khám chuyên khoa",
      note: "Khám lần đầu",
    },
    {
      id: 3,
      date: "2025-06-15",
      time: "10:30",
      doctor: "BS. Lê Văn C",
      specialty: "Thần kinh học",
      room: "Phòng khám chính 1",
      status: "Hoàn thành",
      type: "Tái khám",
      note: "Đã hoàn thành khám",
    },
    {
      id: 4,
      date: "2025-06-10",
      time: "15:00",
      doctor: "BS. Phạm Thị D",
      specialty: "Tâm lý học",
      room: "Phòng tư vấn 1",
      status: "Đã hủy",
      type: "Tư vấn tâm lý",
      note: "Hủy do bận việc đột xuất",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã xác nhận":
        return "bg-green-100 text-green-800";
      case "Chờ xác nhận":
        return "bg-orange-100 text-orange-800";
      case "Hoàn thành":
        return "bg-blue-100 text-blue-800";
      case "Đã hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "Đã xác nhận" || apt.status === "Chờ xác nhận"
  );

  const pastAppointments = appointments.filter(
    (apt) => apt.status === "Hoàn thành" || apt.status === "Đã hủy"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Lịch hẹn của tôi
        </h1>
        <p className="text-gray-600">
          Quản lý và theo dõi các cuộc hẹn khám bệnh
        </p>
      </div>

      {/* Upcoming Appointments */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Lịch hẹn sắp tới ({upcomingAppointments.length})
        </h2>

        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-clinic-blue rounded-lg">
                        <Calendar className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium text-clinic-navy text-lg">
                          {appointment.type}
                        </h3>
                        <p className="text-gray-600">
                          {appointment.doctor} - {appointment.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="ml-16 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <Clock size={16} />
                          <span>
                            {appointment.date} - {appointment.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700">
                          <MapPin size={16} />
                          <span>{appointment.room}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {appointment.note && (
                      <div className="ml-16 mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Ghi chú:</strong> {appointment.note}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button className="px-4 py-2 text-clinic-navy border border-clinic-navy rounded-lg hover:bg-clinic-navy hover:text-white transition-colors">
                      Chi tiết
                    </button>

                    <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors">
                      Hủy hẹn
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Không có lịch hẹn sắp tới</p>
          </div>
        )}
      </div>

      {/* Past Appointments */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Lịch sử khám bệnh ({pastAppointments.length})
        </h2>

        <div className="space-y-4">
          {pastAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-400 rounded-lg">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-clinic-navy">
                        {appointment.type}
                      </h3>
                      <p className="text-gray-600">
                        {appointment.doctor} - {appointment.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="ml-14 flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock size={14} />
                      <span className="text-sm">
                        {appointment.date} - {appointment.time}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>

                {appointment.status === "Hoàn thành" && (
                  <button className="px-4 py-2 clinic-button-secondary">
                    Xem kết quả
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="clinic-card bg-clinic-blue">
        <div className="flex items-center space-x-4 text-clinic-navy">
          <Phone size={24} />
          <div>
            <h3 className="font-medium">Cần hỗ trợ?</h3>
            <p className="text-sm">Liên hệ với chúng tôi: (028) 1234 5678</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
