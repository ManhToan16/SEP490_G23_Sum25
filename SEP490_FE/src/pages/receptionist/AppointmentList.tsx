import React, { useState } from "react";
import { Calendar, Clock, User, Search, Filter } from "lucide-react";

const AppointmentList: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [statusFilter, setStatusFilter] = useState("all");

  const appointments = [
    {
      id: 1,
      time: "08:00",
      patient: "Nguyễn Văn A",
      doctor: "BS. Trần Thị B",
      service: "Khám tổng quát",
      room: "Phòng 1",
      status: "Hoàn thành",
      phone: "0912345678",
    },
    {
      id: 2,
      time: "08:30",
      patient: "Lê Thị C",
      doctor: "BS. Phạm Văn D",
      service: "Khám chuyên khoa",
      room: "Phòng 2",
      status: "Đang khám",
      phone: "0987654321",
    },
    {
      id: 3,
      time: "09:00",
      patient: "Hoàng Văn E",
      doctor: "BS. Trần Thị B",
      service: "Tái khám",
      room: "Phòng 1",
      status: "Chờ khám",
      phone: "0901234567",
    },
    {
      id: 4,
      time: "09:30",
      patient: "Phạm Thị F",
      doctor: "BS. Nguyễn Văn G",
      service: "Tư vấn tâm lý",
      room: "Phòng tư vấn",
      status: "Đã hủy",
      phone: "0976543210",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-green-100 text-green-800";
      case "Đang khám":
        return "bg-blue-100 text-blue-800";
      case "Chờ khám":
        return "bg-orange-100 text-orange-800";
      case "Đã hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAppointments =
    statusFilter === "all"
      ? appointments
      : appointments.filter((apt) => apt.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Lịch hẹn theo ngày
        </h1>
        <p className="text-gray-600">Quản lý và theo dõi lịch hẹn hàng ngày</p>
      </div>

      {/* Filters */}
      <div className="clinic-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ngày
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            >
              <option value="all">Tất cả</option>
              <option value="Chờ khám">Chờ khám</option>
              <option value="Đang khám">Đang khám</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tên bệnh nhân..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appointment List */}
      <div className="clinic-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                  Thời gian
                </th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                  Bệnh nhân
                </th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                  Bác sĩ
                </th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                  Dịch vụ
                </th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                  Phòng
                </th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                  Trạng thái
                </th>
                <th className="text-center py-3 px-4 font-medium text-clinic-navy">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-clinic-navy" />
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <h4 className="font-medium text-clinic-navy">
                        {appointment.patient}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {appointment.phone}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {appointment.doctor}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {appointment.service}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {appointment.room}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center space-x-2">
                      <button className="px-3 py-1 text-clinic-navy border border-clinic-navy rounded hover:bg-clinic-navy hover:text-white transition-colors text-sm">
                        Chi tiết
                      </button>
                      {appointment.status === "Chờ khám" && (
                        <button className="px-3 py-1 clinic-button-primary text-sm">
                          Bắt đầu
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">
            {appointments.length}
          </h3>
          <p className="text-gray-600">Tổng lịch hẹn</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-green-600">
            {appointments.filter((a) => a.status === "Hoàn thành").length}
          </h3>
          <p className="text-gray-600">Đã hoàn thành</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-orange-600">
            {appointments.filter((a) => a.status === "Chờ khám").length}
          </h3>
          <p className="text-gray-600">Đang chờ</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-red-600">
            {appointments.filter((a) => a.status === "Đã hủy").length}
          </h3>
          <p className="text-gray-600">Đã hủy</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;
