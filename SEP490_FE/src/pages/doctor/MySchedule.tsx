import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/shared/hooks/business/useAuth';
import { workScheduleService } from '@/shared/services/workSchedule';
import { adminService } from '@/shared/services/adminService';
import { format, parse, getDay, addDays, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { getWeek, getYear } from 'date-fns';

const getInitialWeekString = () => {
  const today = new Date();
  const year = getYear(today);
  const week = getWeek(today, { weekStartsOn: 1 });
  return `${year}-W${week.toString().padStart(2, '0')}`;
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

const getDateFromWeekString = (weekString: string) => {
  try {
    if (weekString.includes('W')) {
      const [year, week] = weekString.split('-W');
      const yearNum = parseInt(year);
      const weekNum = parseInt(week);

      const jan1 = new Date(yearNum, 0, 1);
      const daysToAdd = (weekNum - 1) * 7;
      const firstDayOfWeek = new Date(jan1);
      firstDayOfWeek.setDate(jan1.getDate() + daysToAdd);

      const dayOfWeek = firstDayOfWeek.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() - daysToMonday);

      return firstDayOfWeek.toISOString().split('T')[0];
    } else {
      return weekString;
    }
  } catch (error) {
    console.error('Error parsing week string:', error);
    return new Date().toISOString().split('T')[0];
  }
};

const DoctorSchedule: React.FC = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(getInitialWeekString());
  const [scheduleData, setScheduleData] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.UserId) return;
      setLoading(true);
      try {
        const { fromDate, toDate } = (() => {
          const startDate = new Date(getDateFromWeekString(selectedWeek));
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          return {
            fromDate: startDate.toISOString().split('T')[0],
            toDate: endDate.toISOString().split('T')[0],
          };
        })();

        const res = await workScheduleService.getSchedulesByRole(user.role, fromDate, toDate);
        setScheduleData(res);
      } catch (error) {
        console.error('Lỗi khi lấy lịch làm việc:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user?.UserId, selectedWeek]);

  useEffect(() => {
    const loadTimeSlots = async () => {
      try {
        const data = await adminService.getTimeSlots();
        setTimeSlots(data);
      } catch (error) {
        console.error('Không thể tải time slots:', error);
      }
    };
    loadTimeSlots();
  }, []);

  const weekDates = useMemo(() => {
    const start = new Date(getDateFromWeekString(selectedWeek));
    return [...Array(7)].map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      return {
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
      };
    });
  }, [selectedWeek]);

  const formatDateFromAPI = (apiDate: string) => {
    if (!apiDate) return '';
    const parts = apiDate.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return apiDate; // fallback
  };

  const schedule = weekDates.map(({ day, date }, idx) => {
    const shifts = scheduleData
      .filter((item) => formatDateFromAPI(item.date) === date)
      .map((item) => {
        const slot = timeSlots.find((s) => s.id === item.timeSlotId);
        return {
          id: item.id,
          type: slot?.name || 'Không rõ',
          startTime: slot?.startTime?.slice(0, 5) || '??',
          endTime: slot?.endTime?.slice(0, 5) || '??',
          room: item.roomName,
          staffName: item.userName || 'Chưa rõ',
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
    <div className="p-6 md:p-10 lg:px-12 lg:py-8 space-y-6">
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
                      <div>👤 {shift.staffName}</div> {/* ← dòng thêm vào */}
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
