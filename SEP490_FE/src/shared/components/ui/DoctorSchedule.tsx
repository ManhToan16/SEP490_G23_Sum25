import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { appointmentService } from '@/shared/services/appointmentService';
import { useToast } from '@/shared/components/ui/use-toast';

interface DoctorScheduleProps {
  doctorId: string;
  doctorName: string;
  onSelectSchedule: (date: string, timeSlotId: string, timeSlotName: string) => void;
}

interface ScheduleItem {
  id: string;
  date: string;
  timeSlotId: string;
  timeSlotName: string;
  startTime: string;
  endTime: string;
  status: string;
}

const DoctorSchedule = ({ doctorId, doctorName, onSelectSchedule }: DoctorScheduleProps) => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const { toast } = useToast();

  // Tính toán khoảng thời gian từ hôm nay đến 6 ngày sau
  const getDefaultDateRange = () => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6);
    
    return {
      from: today.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0]
    };
  };

  // Load time slots
  const loadTimeSlots = async () => {
    try {
      const timeSlotsData = await appointmentService.getTimeSlots();
      setTimeSlots(timeSlotsData);
    } catch (error) {
      console.error('Error loading time slots:', error);
    }
  };

  // Load lịch làm việc của bác sĩ
  const loadDoctorSchedule = async (from?: string, to?: string) => {
    try {
      setLoading(true);
      
      const params = {
        fromDate: from || getDefaultDateRange().from,
        toDate: to || getDefaultDateRange().to
      };

      const response = await appointmentService.getByUserSchedule(doctorId, params);
      
      // Từ console log, response có cấu trúc: {statusCode: 200, success: true, message: "...", data: Array(15)}
      if (response && response.data && Array.isArray(response.data)) {
        
        if (response.data.length > 0) {
          // Log first item để xem cấu trúc data
        }
        
        // Transform data để dễ hiển thị - cần điều chỉnh theo cấu trúc thực tế
        const scheduleData = response.data.map((item: any) => {
          // Tìm timeSlot tương ứng
          const timeSlot = timeSlots.find(ts => ts.id === item.timeSlotId);
          
          // Kiểm tra các trường có thể có
          const mappedItem = {
            id: item.id,
            date: item.date || item.dateOfBirth || item.scheduleDate,
            timeSlotId: item.timeSlotId,
            timeSlotName: timeSlot?.name || 'Không xác định',
            startTime: timeSlot?.startTime || '00:00',
            endTime: timeSlot?.endTime || '00:00',
            status: item.status || 'AVAILABLE'
          };
          
          return mappedItem;
        });
        
        setSchedules(scheduleData);
        
        // Set default date range nếu chưa có
        if (!fromDate && !toDate) {
          setFromDate(params.fromDate);
          setToDate(params.toDate);
        }
      } else {
        setSchedules([]);
      }
    } catch (error: any) {
      console.error('Error loading doctor schedule:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch làm việc của bác sĩ",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load time slots khi component mount
  useEffect(() => {
    loadTimeSlots();
  }, []);

  // Load lịch khi component mount hoặc khi timeSlots thay đổi
  useEffect(() => {
    if (doctorId && timeSlots.length > 0) {
      // Tự động set date range từ hôm nay đến 6 ngày sau
      const defaultRange = getDefaultDateRange();
      setFromDate(defaultRange.from);
      setToDate(defaultRange.to);
      
      loadDoctorSchedule(defaultRange.from, defaultRange.to);
    }
  }, [doctorId, timeSlots]);

  // Xử lý thay đổi khoảng thời gian
  const handleDateRangeChange = () => {
    if (fromDate && toDate) {
      loadDoctorSchedule(fromDate, toDate);
    }
  };

  // Xử lý chọn lịch hẹn
  const handleSelectSchedule = (date: string, timeSlotId: string, timeSlotName: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlotId);
    
    // Convert date từ format DD/MM/YYYY sang YYYY-MM-DD cho API
    try {
      const [day, month, year] = date.split('/');
      const convertedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      onSelectSchedule(convertedDate, timeSlotId, timeSlotName);
    } catch (error) {
      console.error('Error converting date:', error);
      onSelectSchedule(date, timeSlotId, timeSlotName);
    }
  };

  // Handle button click with preventDefault
  const handleScheduleButtonClick = (e: React.MouseEvent, date: string, timeSlotId: string, timeSlotName: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleSelectSchedule(date, timeSlotId, timeSlotName);
  };

  // Format ngày
  const formatDate = (dateString: string) => {
    try {
      // Parse date string theo format DD/MM/YYYY
      const [day, month, year] = dateString.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Kiểm tra date hợp lệ
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Ngày không hợp lệ';
      }
      
      // Luôn hiển thị format đầy đủ: "Thứ [tên thứ], [ngày] tháng [tháng], [năm]"
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Ngày không hợp lệ';
    }
  };

  // Nhóm lịch theo ngày và sắp xếp theo thứ tự
  const groupSchedulesByDate = () => {
    const grouped: { [key: string]: ScheduleItem[] } = {};
    
    schedules.forEach(schedule => {
      if (!grouped[schedule.date]) {
        grouped[schedule.date] = [];
      }
      grouped[schedule.date].push(schedule);
    });
    
    // Sắp xếp các ngày theo thứ tự tăng dần
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      try {
        const [dayA, monthA, yearA] = a.split('/');
        const [dayB, monthB, yearB] = b.split('/');
        
        const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
        
        return dateA.getTime() - dateB.getTime();
      } catch (error) {
        console.error('Error sorting dates:', error);
        return 0;
      }
    });
    
    // Tạo object mới với thứ tự đã sắp xếp và sắp xếp ca trong từng ngày
    const sortedGrouped: { [key: string]: ScheduleItem[] } = {};
    sortedDates.forEach(date => {
      // Sắp xếp các ca trong ngày theo thứ tự thời gian
      const sortedSchedules = grouped[date].sort((a, b) => {
        // So sánh theo startTime
        const timeA = a.startTime;
        const timeB = b.startTime;
        return timeA.localeCompare(timeB);
      });
      
      sortedGrouped[date] = sortedSchedules;
    });
    
    return sortedGrouped;
  };

  const groupedSchedules = groupSchedulesByDate();

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Lịch làm việc của bác sĩ {doctorName}
        </h3>
        
        {/* Date Range Selection */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="fromDate">Từ ngày</Label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="toDate">Đến ngày</Label>
            <Input
              id="toDate"
              type="date"
              value={toDate}
              min={fromDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleDateRangeChange}
              disabled={!fromDate || !toDate || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Xem lịch
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải lịch làm việc...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không có lịch làm việc trong khoảng thời gian này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
            <div key={date} className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                {formatDate(date)}
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {daySchedules.map((schedule) => (
                  <Button
                    key={schedule.id}
                    variant={selectedDate === date && selectedTimeSlot === schedule.timeSlotId ? "default" : "outline"}
                    className={`text-sm h-auto py-3 px-4 transition-all duration-200 ${
                      selectedDate === date && selectedTimeSlot === schedule.timeSlotId 
                        ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md" 
                        : "bg-white hover:bg-blue-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                    onClick={(e) => handleScheduleButtonClick(e, date, schedule.timeSlotId, schedule.timeSlotName)}
                  >
                    <div className="text-center">
                      <div className="font-medium text-sm">
                        {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                      </div>
                      <div className="text-xs mt-1">
                        {schedule.timeSlotName}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default DoctorSchedule; 