
import React, { useState } from 'react';
import { Calendar, Clock, User, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateAppointment: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    serviceId: '',
    date: '',
    time: '',
    room: '',
    note: ''
  });

  const patients = [
    { id: 1, name: 'Nguyễn Văn A', phone: '0912345678' },
    { id: 2, name: 'Trần Thị B', phone: '0987654321' },
    { id: 3, name: 'Lê Văn C', phone: '0901234567' }
  ];

  const doctors = [
    { id: 1, name: 'BS. Nguyễn Thị D', specialty: 'Thần kinh học' },
    { id: 2, name: 'BS. Trần Văn E', specialty: 'Tâm thần học' },
    { id: 3, name: 'BS. Lê Thị F', specialty: 'Tâm lý học' }
  ];

  const services = [
    { id: 1, name: 'Khám tổng quát', fee: '500.000đ' },
    { id: 2, name: 'Khám chuyên khoa', fee: '800.000đ' },
    { id: 3, name: 'Tư vấn tâm lý', fee: '400.000đ' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00'
  ];

  const rooms = ['Phòng 1', 'Phòng 2', 'Phòng tư vấn', 'Phòng xét nghiệm'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Tạo lịch hẹn thành công!');
    navigate('/receptionist/appointments');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/receptionist/appointments')}
          className="flex items-center space-x-2 text-clinic-navy hover:text-clinic-blue"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Tạo lịch hẹn mới
          </h1>
          <p className="text-gray-600">
            Đặt lịch hẹn cho bệnh nhân
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="clinic-card">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
              Thông tin lịch hẹn
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bệnh nhân *
                </label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                >
                  <option value="">Chọn bệnh nhân</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bác sĩ *
                </label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                >
                  <option value="">Chọn bác sĩ</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dịch vụ *
                </label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                >
                  <option value="">Chọn dịch vụ</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.fee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng khám *
                </label>
                <select
                  name="room"
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                >
                  <option value="">Chọn phòng</option>
                  {rooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Ngày khám *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Giờ khám *
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                >
                  <option value="">Chọn giờ</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                  placeholder="Nhập ghi chú hoặc triệu chứng..."
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex items-center space-x-2 clinic-button-primary"
            >
              <Save size={20} />
              <span>Tạo lịch hẹn</span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/receptionist/appointments')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAppointment;
