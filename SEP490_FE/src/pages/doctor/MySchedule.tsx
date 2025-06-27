
import React, { useState } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';

const DoctorSchedule: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0]);

  const schedule = [
    {
      id: 1,
      day: 'Thứ 2',
      date: '2025-06-23',
      shifts: [
        { id: 1, startTime: '08:00', endTime: '12:00', type: 'Sáng', room: 'Phòng 1' },
        { id: 2, startTime: '13:30', endTime: '17:00', type: 'Chiều', room: 'Phòng 1' }
      ]
    },
    {
      id: 2,
      day: 'Thứ 3',
      date: '2025-06-24',
      shifts: []
    },
    {
      id: 3,
      day: 'Thứ 4',
      date: '2025-06-25',
      shifts: [
        { id: 3, startTime: '08:00', endTime: '12:00', type: 'Sáng', room: 'Phòng 2' },
        { id: 4, startTime: '14:00', endTime: '17:00', type: 'Chiều', room: 'Phòng 2' }
      ]
    },
    {
      id: 4,
      day: 'Thứ 5',
      date: '2025-06-26',
      shifts: []
    },
    {
      id: 5,
      day: 'Thứ 6',
      date: '2025-06-27',
      shifts: [
        { id: 5, startTime: '08:00', endTime: '12:00', type: 'Sáng', room: 'Phòng 1' }
      ]
    },
    {
      id: 6,
      day: 'Thứ 7',
      date: '2025-06-28',
      shifts: []
    },
    {
      id: 7,
      day: 'Chủ nhật',
      date: '2025-06-29',
      shifts: []
    }
  ];

  const totalHours = schedule.reduce((total, day) => {
    return total + day.shifts.reduce((dayTotal, shift) => {
      const start = new Date(`2000-01-01T${shift.startTime}`);
      const end = new Date(`2000-01-01T${shift.endTime}`);
      return dayTotal + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Lịch làm việc
          </h1>
          <p className="text-gray-600">
            Quản lý và cập nhật lịch trình làm việc
          </p>
        </div>
        
        <button className="flex items-center space-x-2 clinic-button-primary">
          <Plus size={20} />
          <span>Thêm ca làm việc</span>
        </button>
      </div>

      {/* Week Selector */}
      <div className="clinic-card">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tuần làm việc
            </label>
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            />
          </div>
          
          <div className="flex-1 text-right">
            <p className="text-sm text-gray-600">Tổng giờ làm việc tuần này</p>
            <p className="text-2xl font-bold text-clinic-navy">{totalHours}h</p>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {schedule.map((day) => (
          <div key={day.id} className="clinic-card">
            <div className="text-center mb-4">
              <h3 className="font-medium text-clinic-navy">{day.day}</h3>
              <p className="text-sm text-gray-600">{day.date}</p>
            </div>
            
            <div className="space-y-2">
              {day.shifts.length > 0 ? (
                day.shifts.map((shift) => (
                  <div key={shift.id} className="p-3 bg-clinic-blue rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-clinic-navy">
                        {shift.type}
                      </span>
                      <div className="flex space-x-1">
                        <button className="p-1 text-clinic-navy hover:bg-white rounded">
                          <Edit size={14} />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-white rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm text-clinic-navy">
                        <Clock size={12} />
                        <span>{shift.startTime} - {shift.endTime}</span>
                      </div>
                      <div className="text-sm text-clinic-navy">
                        📍 {shift.room}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Calendar size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Không có ca làm việc</p>
                  <button className="mt-2 text-clinic-navy hover:underline text-sm">
                    + Thêm ca
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">
            {schedule.filter(d => d.shifts.length > 0).length}
          </h3>
          <p className="text-gray-600">Ngày làm việc</p>
        </div>
        
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">
            {schedule.reduce((total, d) => total + d.shifts.length, 0)}
          </h3>
          <p className="text-gray-600">Tổng ca làm việc</p>
        </div>
        
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">{totalHours}h</h3>
          <p className="text-gray-600">Tổng giờ làm việc</p>
        </div>
      </div>

      {/* Upcoming Changes */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Thay đổi lịch sắp tới
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <h4 className="font-medium text-yellow-800">
                Thay đổi ca làm việc
              </h4>
              <p className="text-sm text-yellow-700">
                Thứ 3, 25/06 - Ca sáng được chuyển từ Phòng 1 sang Phòng 2
              </p>
            </div>
            <button className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">
              Xác nhận
            </button>
          </div>
        
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;
