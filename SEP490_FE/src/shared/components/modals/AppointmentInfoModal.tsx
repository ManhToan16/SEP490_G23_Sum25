import React from 'react';
import { X, Calendar, User, Phone, Mail, MapPin, Clock, DollarSign, FileText } from 'lucide-react';
import { Appointment } from '@/shared/services/appointmentService';

interface AppointmentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  loading?: boolean;
}

const AppointmentInfoModal: React.FC<AppointmentInfoModalProps> = ({
  isOpen,
  onClose,
  appointment,
  loading = false
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'waiting_for_confirmation':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting_for_check_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_in':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'waiting_for_confirmation':
        return 'Chờ xác nhận';
      case 'waiting_for_check_in':
        return 'Chờ check-in';
      case 'checked_in':
        return 'Đã check-in';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Thông tin lịch khám
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : appointment ? (
            <div className="space-y-6">
              {/* Thông tin bệnh nhân */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User size={20} className="mr-2 text-blue-600" />
                  Thông tin bệnh nhân
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <p className="text-gray-900">{appointment.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính
                    </label>
                    <p className="text-gray-900">{appointment.gender}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    <p className="text-gray-900">{formatDate(appointment.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Phone size={16} className="mr-1 text-gray-500" />
                      {appointment.phoneNumber}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Mail size={16} className="mr-1 text-gray-500" />
                      {appointment.email}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <p className="text-gray-900 flex items-start">
                      <MapPin size={16} className="mr-1 text-gray-500 mt-0.5" />
                      {appointment.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin lịch khám */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar size={20} className="mr-2 text-blue-600" />
                  Thông tin lịch khám
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày khám
                    </label>
                    <p className="text-gray-900">{formatDate(appointment.date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ khám
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Clock size={16} className="mr-1 text-gray-500" />
                      {appointment.timeSlotStartTime} - {appointment.timeSlotEndTime}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bác sĩ yêu cầu
                    </label>
                    <p className="text-gray-900">{appointment.requiredDoctorName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tổng chi phí
                    </label>
                    <p className="text-gray-900 flex items-center font-semibold">
                      <DollarSign size={16} className="mr-1 text-gray-500" />
                      {formatCurrency(appointment.totalPrice)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày tạo
                    </label>
                    <p className="text-gray-900">{formatDateTime(appointment.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Triệu chứng */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText size={20} className="mr-2 text-orange-600" />
                  Triệu chứng
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">{appointment.symptom}</p>
              </div>

              {/* Thông tin hệ thống */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Thông tin hệ thống
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Lịch hẹn
                    </label>
                    <p className="text-gray-600 font-mono">{appointment.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Time Slot
                    </label>
                    <p className="text-gray-600 font-mono">{appointment.timeSlotId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Bác sĩ
                    </label>
                    <p className="text-gray-600 font-mono">{appointment.requiredDoctorId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hết hạn lúc
                    </label>
                    <p className="text-gray-600">{formatDateTime(appointment.expiredAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Không thể tải thông tin lịch khám</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentInfoModal;