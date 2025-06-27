
import React, { useState } from 'react';
import { Clock, User, FileText, Eye, Play, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const AppointmentQueue: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  const handleCreateRecord = () => {
    // Navigate to create medical record page
    navigate('/doctor/create-record');
  }

  const appointments = [
    {
      id: 1,
      time: '14:00',
      patient: {
        name: 'Nguyễn Văn A',
        age: 35,
        gender: 'Nam',
        phone: '0912345678'
      },
      reason: 'Đau đầu mãn tính',
      status: 'Đang làm chỉ định',
      priority: 'Bình thường',
      lastVisit: '2025-06-01'
    },
    {
      id: 2,
      time: '14:30',
      patient: {
        name: 'Trần Thị B',
        age: 42,
        gender: 'Nữ',
        phone: '0987654321'
      },
      reason: 'Rối loạn giấc ngủ',
      status: 'Đang chờ',
      priority: 'Cao',
      lastVisit: null
    },
    {
      id: 3,
      time: '15:00',
      patient: {
        name: 'Lê Văn C',
        age: 28,
        gender: 'Nam',
        phone: '0901234567'
      },
      reason: 'Stress, lo âu',
      type: 'Tư vấn',
      status: 'Đang gọi',
      priority: 'Bình thường',
      lastVisit: '2025-05-15'
    },
    {
      id: 4,
      time: '13:30',
      patient: {
        name: 'Phạm Thị D',
        age: 55,
        gender: 'Nữ',
        phone: '0976543210'
      },
      reason: 'Kiểm tra định kỳ',
      type: 'Tái khám',
      status: 'Hoàn thành',
      priority: 'Bình thường',
      lastVisit: '2025-05-30'
    }
  ];

  const statusOptions = [
    { label: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Đang gọi', color: 'bg-blue-100 text-blue-800' },
    { label: 'Đang làm chỉ định', color: 'bg-purple-100 text-purple-800' },
    { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
  ];

  const [appointmentList, setAppointmentList] = useState(appointments);

  const updateAppointmentStatus = (id: number, newStatus: string) => {
    setAppointmentList(prev =>
      prev.map(apt =>
        apt.id === id ? { ...apt, status: newStatus } : apt
      )
    );
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.label === status);
    return option ? option.color : 'bg-gray-100 text-gray-800';
  };

const waitingStatuses = ['Đang chờ', 'Đang gọi', 'Đang làm chỉ định','Đã hủy'];
const waitingAppointments = appointmentList.filter(apt => waitingStatuses.includes(apt.status));  const completedAppointments = appointmentList.filter(apt => apt.status === 'Hoàn thành');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Hàng chờ khám bệnh
        </h1>
        <p className="text-gray-600">
          Danh sách bệnh nhân chờ khám và đã khám
        </p>
      </div>

      {/* Date Selector and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="clinic-card">
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

        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">{appointmentList.length}</h3>
          <p className="text-gray-600 text-sm">Tổng lịch hẹn</p>
        </div>

        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-yellow-600">{waitingAppointments.length}</h3>
          <p className="text-gray-600 text-sm">Đang chờ</p>
        </div>

        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-green-600">{completedAppointments.length}</h3>
          <p className="text-gray-600 text-sm">Đã hoàn thành</p>
        </div>

        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-red-600">
            {appointmentList.filter(a => a.priority === 'Cao').length}
          </h3>
          <p className="text-gray-600 text-sm">Ưu tiên cao</p>
        </div>
      </div>

      {/* Waiting Queue */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Hàng chờ khám ({appointmentList.length})
        </h2>

        <div className="space-y-4">
          {waitingAppointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 bg-clinic-blue rounded-lg flex items-center justify-center">
                      <User className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-clinic-navy text-lg">
                        {appointment.patient.name} ({appointment.patient.age} tuổi, {appointment.patient.gender})
                      </h3>
                      <p className="text-gray-600">{appointment.reason}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          📞 {appointment.patient.phone}
                        </span>
                        {appointment.lastVisit && (
                          <span className="text-sm text-gray-500">
                            Lần khám cuối: {appointment.lastVisit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-16 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-700">{appointment.time}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>

                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {appointment.type}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <select
                    value={appointment.status}
                    onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value)}
                    className={`px-2 py-1 rounded text-sm ${getStatusColor(appointment.status)}`}
                  >
                    {statusOptions.map(option => (
                      <option key={option.label} value={option.label}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => updateAppointmentStatus(appointment.id, 'Đang gọi')}
                    className="flex items-center space-x-1 px-3 py-2 text-clinic-navy border border-clinic-navy rounded-lg hover:bg-clinic-navy hover:text-white transition-colors"
                  >
                    <Eye size={16} />
                    <span>Gọi bệnh nhân</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-2 text-clinic-navy border border-clinic-navy rounded-lg hover:bg-clinic-navy hover:text-white transition-colors">
                    <Eye size={16} />
                    <span>Xem hồ sơ</span>
                  </button>
                  <button onClick={handleCreateRecord} className="flex items-center space-x-1 px-3 py-2 clinic-button-primary">
                    <Play size={16} />
                    <span>Tạo hồ sơ</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {waitingAppointments.length === 0 && (
            <div className="text-center py-8">
              <Clock className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Không có bệnh nhân nào đang chờ khám</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Today */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Đã khám xong hôm nay ({completedAppointments.length})
        </h2>

        <div className="space-y-3">
          {completedAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-clinic-navy">
                    {appointment.time} - {appointment.patient.name}
                  </h4>
                  <p className="text-gray-600 text-sm">{appointment.reason}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center space-x-1 px-3 py-1 text-clinic-navy hover:bg-white rounded transition-colors">
                  <FileText size={14} />
                  <span className="text-sm">Xem kết quả</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AppointmentQueue;
