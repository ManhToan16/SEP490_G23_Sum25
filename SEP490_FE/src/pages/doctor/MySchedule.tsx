import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/shared/hooks/business/useAuth';
import { workScheduleService } from '@/shared/services/workSchedule';
import { adminService } from '@/shared/services/adminService';
import { format, parse, getDay, addDays, startOfWeek } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { vi } from 'date-fns/locale/vi';
import { getWeek, getYear } from 'date-fns';
import { useSchedule } from '@/shared/hooks/business/useSchedule';


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

  const { schedules: apiSchedules, loading: scheduleLoading, loadSchedulesByRole, addSchedule: addScheduleAPI, removeSchedule: removeScheduleAPI } = useSchedule();

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.UserId) return;
      console.log('Fetching schedule for user:', user);
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

        const res = await workScheduleService.getSchedulesById(user.UserId, fromDate, toDate);
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

  const getScheduleForDay = useCallback((day: string, timeSlotId: string) => {
    return apiSchedules.filter(schedule => {
      if (!schedule || !schedule.date) return false;
      const scheduleDate = formatDateFromAPI(schedule.date);
      return scheduleDate === day && schedule.timeSlotId === timeSlotId;
    });
  }, [apiSchedules]);

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
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="flex-1 overflow-auto">
        <Table className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-white">
              <TableHead className="w-28 text-xs font-semibold text-clinic-navy border-r border-gray-200">
                Thời gian
              </TableHead>
              {weekDates.map((day) => (
                <TableHead
                  key={day.date}
                  className="text-center min-w-28 text-xs font-semibold text-clinic-navy border-r border-gray-200"
                >
                  <div className="p-1">
                    <div>{day.day}</div>
                    <div className="text-xs text-gray-500">{day.date}</div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {timeSlots.map((timeSlot) => (
              <TableRow key={timeSlot.id} className="bg-white">   {/* ✅ luôn trắng */}
                {/* Cột giờ */}
                <TableCell className="font-medium sticky left-0 bg-white z-10 p-2 border-r border-gray-200">
                  <div className="flex items-center space-x-1">
                    <Clock size={12} className="text-clinic-navy" />
                    <div>
                      <div className="font-semibold text-clinic-navy text-xs">{timeSlot.name}</div>
                      <div className="text-xs text-gray-500">
                        {timeSlot.startTime} - {timeSlot.endTime}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Các ngày trong tuần */}
                {weekDates.map(day => {
                  const daySchedules = scheduleData.filter(
                    item => formatDateFromAPI(item.date) === day.date && item.timeSlotId === timeSlot.id
                  );
                  return (
                    <TableCell
                      key={`${day.date}-${timeSlot.id}`}
                      className="p-1 align-top border-r border-gray-200 bg-white"
                    >
                      <div className="space-y-1 min-h-[50px]">
                        {daySchedules.map((sch, index) => (
                          <div
                            key={`${sch.id}-${index}`}
                            className="p-2 bg-blue-200 rounded-lg border border-blue-300 shadow-sm cursor-pointer hover:shadow-md transition"
                          >
                            <div className="text-xs font-semibold text-clinic-navy">{sch.userName}</div>
                            <div className="text-xs text-gray-600">{sch.roomName}</div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DoctorSchedule;
