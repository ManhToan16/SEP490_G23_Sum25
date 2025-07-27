import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/shared/hooks/business/useAuth';
import { workScheduleService } from '@/shared/services/workSchedule';
import { format, parse, getDay, addDays, startOfWeek } from 'date-fns';
import {vi} from 'date-fns/locale/vi';

const SLOT_INFO = {
  TS001: { type: 'Sáng', startTime: '08:00', endTime: '12:00' },
  TS002: { type: 'Chiều', startTime: '13:30', endTime: '17:00' },
};

const getWeekDates = (selectedDate: Date) => {
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Thứ 2
  return [...Array(7)].map((_, i) => {
    const date = addDays(start, i);
    return {
      day: format(date, 'EEEE', { locale: vi }).replace(/^thứ/i, 'Thứ'),
      date: format(date, 'yyyy-MM-dd'),
    };
  });
};

const DoctorSchedule: React.FC = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.UserId) return;
      setLoading(true);
      try {
        const res = await workScheduleService.getScheduleRole(user.role);
        setScheduleData(res.data);
      } catch (error) {
        console.error('Lỗi khi lấy lịch làm việc:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user?.UserId]);

  const weekDates = getWeekDates(new Date(selectedWeek));

  const schedule = weekDates.map(({ day, date }, idx) => {
    const shifts = scheduleData
      .filter((item) => {
        const [d, m, y] = item.date.split('/');
        const itemDate = `${y}-${m}-${d}`;
        return itemDate === date;
      })
      .map((item) => {
        const slot = SLOT_INFO[item.timeSlotId] || {};
        return {
          id: item.id,
          type: slot.type || 'Không rõ',
          startTime: slot.startTime || '??',
          endTime: slot.endTime || '??',
          room: item.roomName,
        };
      });

    return { id: idx + 1, day, date, shifts };
  });

  const totalHours = schedule.reduce((total, day) => {
    return total + day.shifts.reduce((sum, shift) => {
      const start = new Date(`2000-01-01T${shift.startTime}`);
      const end = new Date(`2000-01-01T${shift.endTime}`);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Lịch làm việc
          </h1>
          <p className="text-gray-600">Quản lý và cập nhật lịch trình làm việc</p>
        </div>
      </div>

      {/* Week Selector */}
      <div className="clinic-card">
        <div className="flex items-center justify-between">
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
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng giờ làm việc</p>
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
                    </div>
                    <div className="space-y-1 text-sm text-clinic-navy">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{shift.startTime} - {shift.endTime}</span>
                      </div>
                      <div>📍 {shift.room}</div>
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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">
            {schedule.filter((d) => d.shifts.length > 0).length}
          </h3>
          <p className="text-gray-600">Ngày làm việc</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">
            {schedule.reduce((sum, d) => sum + d.shifts.length, 0)}
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
              <h4 className="font-medium text-yellow-800">Thay đổi ca làm việc</h4>
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
