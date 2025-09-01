import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { Calendar, Clock, Users, User, Plus, Edit, Save, X, Building, AlertTriangle, Heart, Upload, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { useToast } from '@/shared/components/ui/use-toast';
import { adminService } from '@/shared/services/adminService';
import { useSchedule } from '@/shared/hooks/business/useSchedule';
import { useRealtimeSchedule } from '@/shared/hooks/business/useRealtimeSchedule';

// Helper functions
const getWeekNumber = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const getInitialWeekString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const week = getWeekNumber(today);
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

const getCurrentWeekRange = () => {
  const today = new Date();
  const monday = new Date(today);
  const dayOfWeek = monday.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(monday.getDate() - daysToMonday);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0]
  };
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

const formatDateForAPI = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString();
};

const formatDateFromAPI = (dateString: string) => {
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateString;
};

// Compact Staff Item Component
const StaffItem = memo(({ 
  schedule, 
  onRemove, 
  getStaffName, 
  onClick 
}: { 
  schedule: any; 
  onRemove: (scheduleId: string) => void;
  getStaffName: (staffId: string) => string;
  onClick: () => void;
}) => {
  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove(schedule.id);
  }, [onRemove, schedule.id]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  }, [onClick]);

  const staffName = useMemo(() => getStaffName(schedule.userId), [getStaffName, schedule.userId]);

  return (
    <div
      className="flex items-center justify-between p-1.5 bg-clinic-blue rounded text-xs hover:bg-blue-600 transition-colors cursor-pointer"
      onClick={handleEditClick}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-clinic-navy truncate text-xs">
          {staffName}
        </div>
        <div className="flex items-center space-x-1 text-clinic-navy">
          <Building size={10} className="flex-shrink-0" />
          <span className="text-xs truncate">{schedule.roomName}</span>
        </div>
      </div>
      
      <button
        onClick={handleDeleteClick}
        className="text-red-600 hover:bg-red-50 p-0.5 rounded flex-shrink-0 z-10 transition-colors"
        type="button"
      >
        <X size={12} />
      </button>
    </div>
  );
});
StaffItem.displayName = 'StaffItem';

const ScheduleManagement: React.FC = () => {
  // States with validation
  const [selectedWeek, setSelectedWeek] = useState(() => {
    try {
      return getInitialWeekString();
    } catch (error) {
      console.error('Error getting initial week:', error);
      return `${new Date().getFullYear()}-W01`;
    }
  });
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    try {
      return new Date().toISOString().split('T')[0].substring(0, 7);
    } catch (error) {
      console.error('Error getting initial month:', error);
      return `${new Date().getFullYear()}-01`;
    }
  });
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState<'doctors' | 'technicians' | 'nurses'>('doctors');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffOptions, setStaffOptions] = useState<any[]>([]);
  const [roomOptions, setRoomOptions] = useState<any[]>([]);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [editRoomId, setEditRoomId] = useState('');
  const [editTimeSlotId, setEditTimeSlotId] = useState('');
  const [editStatus, setEditStatus] = useState('SCHEDULED');
  const [statistics, setStatistics] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Hooks
  const { toast } = useToast();
  const { schedules: apiSchedules, loading: scheduleLoading, loadSchedulesByRole, addSchedule: addScheduleAPI, removeSchedule: removeScheduleAPI } = useSchedule();
  const hasLoadedRef = useRef(false);
  const currentParamsRef = useRef<string>('');

  // Mock data
  const doctors = [
    { id: 1, name: 'BS. Nguyễn Văn A', specialty: 'Thần kinh' },
    { id: 2, name: 'BS. Trần Thị B', specialty: 'Tâm lý' },
    { id: 3, name: 'BS. Lê Văn C', specialty: 'Nội thần kinh' },
    { id: 4, name: 'BS. Phạm Thị D', specialty: 'Phục hồi chức năng' },
  ];

  const technicians = [
    { id: 1, name: 'KTV. Hoàng Văn E', specialty: 'X-quang' },
    { id: 2, name: 'KTV. Nguyễn Thị F', specialty: 'MRI' },
    { id: 3, name: 'KTV. Trần Văn G', specialty: 'CT Scan' },
    { id: 4, name: 'KTV. Lê Thị H', specialty: 'Siêu âm' },
    { id: 5, name: 'KTV. Phạm Văn I', specialty: 'EEG' },
  ];

  const nurses = [
    { id: 1, name: 'YT. Nguyễn Thị J', specialty: 'Điều dưỡng thần kinh' },
    { id: 2, name: 'YT. Trần Văn K', specialty: 'Điều dưỡng tâm lý' },
    { id: 3, name: 'YT. Lê Thị L', specialty: 'Điều dưỡng phục hồi' },
    { id: 4, name: 'YT. Phạm Văn M', specialty: 'Điều dưỡng cấp cứu' },
    { id: 5, name: 'YT. Hoàng Thị N', specialty: 'Điều dưỡng nội khoa' },
  ];

  const doctorRooms = ['Phòng 1', 'Phòng 2', 'Phòng 3', 'Phòng 4', 'Phòng 5'];
  const technicianRooms = ['Phòng A', 'Phòng B', 'Phòng C', 'Phòng D', 'Phòng E', 'Phòng F', 'Phòng G'];
  const nurseRooms = ['Phòng YT1', 'Phòng YT2', 'Phòng YT3', 'Phòng YT4', 'Phòng YT5', 'Phòng YT6'];

  // Helper chuyển role FE -> BE
  const getRoleApi = (tab: string) => {
    switch (tab) {
      case 'doctors': return 'DOCTOR';
      case 'technicians': return 'TECHNICIAN';
      case 'nurses': return 'NURSE';
      default: return 'DOCTOR';
    }
  };

  // Helper functions with useCallback
  const getCurrentScheduleParams = useCallback(() => {
    const roleMap = {
      doctors: 'DOCTOR',
      technicians: 'TECHNICIAN',
      nurses: 'NURSE',
    };
    const role = roleMap[activeTab];
    let fromDate, toDate;
    
    try {
      if (viewMode === 'week') {
        const weekStart = getDateFromWeekString(selectedWeek);
        const startDate = new Date(weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        fromDate = startDate.toISOString().split('T')[0];
        toDate = endDate.toISOString().split('T')[0];
      } else {
        // Month view
        const [year, month] = selectedMonth.split('-');
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        
        if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          throw new Error(`Invalid month format: ${selectedMonth}`);
        }
        
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0); // Last day of month
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error(`Invalid date calculation for month: ${selectedMonth}`);
        }
        
        fromDate = startDate.toISOString().split('T')[0];
        toDate = endDate.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Error calculating date range:', error);
      // Fallback to current week
      const today = new Date();
      const monday = new Date(today);
      const dayOfWeek = monday.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      monday.setDate(monday.getDate() - daysToMonday);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      fromDate = monday.toISOString().split('T')[0];
      toDate = sunday.toISOString().split('T')[0];
    }
    
    return { role, fromDate, toDate };
  }, [activeTab, viewMode, selectedWeek, selectedMonth]);

  // Get current schedule parameters for realtime
  const { role, fromDate, toDate } = getCurrentScheduleParams();
  
  // Debug logging for params
  useEffect(() => {
    console.log('📅 Schedule params changed:', { role, fromDate, toDate, viewMode, activeTab });
  }, [role, fromDate, toDate, viewMode, activeTab]);
  
  // Initialize realtime connection with stable params
  const stableRealtimeParams = useMemo(() => ({
    role,
    fromDate,
    toDate
  }), [role, fromDate, toDate]);
  
  useRealtimeSchedule(stableRealtimeParams.role, stableRealtimeParams.fromDate, stableRealtimeParams.toDate);

  const refreshSchedules = useCallback(async () => {
    const { role, fromDate, toDate } = getCurrentScheduleParams();
    await loadSchedulesByRole(role, fromDate, toDate);
    currentParamsRef.current = `${role}-${fromDate}-${toDate}`;
  }, [getCurrentScheduleParams, loadSchedulesByRole]);

  // Memoized values
  const weekDays = useMemo(() => {
    const getWeekDays = (weekStart: string) => {
      try {
        const actualDate = getDateFromWeekString(weekStart);
        const startDate = new Date(actualDate);
        
        if (isNaN(startDate.getTime())) {
          console.error('Invalid date:', weekStart);
          return [];
        }
        
        const days = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          
          if (isNaN(date.getTime())) {
            console.error('Invalid calculated date');
            continue;
          }
          
          const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
          days.push({
            id: `day-${i}`,
            name: dayNames[date.getDay()],
            date: date.toISOString().split('T')[0]
          });
        }
        return days;
      } catch (error) {
        console.error('Error in getWeekDays:', error);
        const today = new Date();
        const monday = new Date(today);
        const dayOfWeek = monday.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        monday.setDate(monday.getDate() - daysToMonday);
        
        const days = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(monday);
          date.setDate(monday.getDate() + i);
          const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
          days.push({
            id: `day-${i}`,
            name: dayNames[date.getDay()],
            date: date.toISOString().split('T')[0]
          });
        }
        return days;
      }
    };
    return getWeekDays(selectedWeek);
  }, [selectedWeek]);

  const monthDays = useMemo(() => {
    const getMonthDays = (monthYear: string) => {
      const [year, month] = monthYear.split('-').map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const days = [];
      
      const firstDayOfWeek = firstDay.getDay();
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({ id: `empty-${i}`, name: '', date: '', isEmpty: true });
      }
      
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        days.push({
          id: `day-${day}`,
          name: dayNames[date.getDay()],
          date: date.toISOString().split('T')[0],
          dayNumber: day
        });
      }
      return days;
    };
    return getMonthDays(selectedMonth);
  }, [selectedMonth]);

  const currentStaff = useMemo(() => {
    switch (activeTab) {
      case 'doctors': return doctors;
      case 'technicians': return technicians;
      case 'nurses': return nurses;
      default: return doctors;
    }
  }, [activeTab, doctors, technicians, nurses]);
  
  const currentRooms = useMemo(() => {
    switch (activeTab) {
      case 'doctors': return doctorRooms;
      case 'technicians': return technicianRooms;
      case 'nurses': return nurseRooms;
      default: return doctorRooms;
    }
  }, [activeTab, doctorRooms, technicianRooms, nurseRooms]);

  const currentWeekRange = useMemo(() => getCurrentWeekRange(), []);

  const getStaffTypeName = useCallback(() => {
    switch (activeTab) {
      case 'doctors': return 'bác sĩ';
      case 'technicians': return 'kỹ thuật viên';
      case 'nurses': return 'y tá';
      default: return 'nhân viên';
    }
  }, [activeTab]);

  // Helper function to get userId from localStorage
  const getUserIdFromLocalStorage = useCallback(() => {
    try {
      const userData = localStorage.getItem('clinic_user_data');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.UserId;
      }
      return null;
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      return null;
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is Excel
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.ms-excel.sheet.macroEnabled.12'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Lỗi định dạng file",
          description: "Vui lòng chọn file Excel (.xlsx, .xls)",
          variant: 'destructive',
        });
        return;
      }
      
      setSelectedFile(file);
    }
  }, [toast]);

  // Handle import Excel file
  const handleImportExcel = useCallback(async () => {
    if (!selectedFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file Excel để import",
        variant: 'destructive',
      });
      return;
    }

    const userId = getUserIdFromLocalStorage();
    if (!userId) {
      toast({
        title: "Lỗi",
        description: "Không thể lấy thông tin người dùng",
        variant: 'destructive',
      });
      return;
    }

    setImportLoading(true);
    try {
      await adminService.importScheduleFromExcel(selectedFile, userId);
      
      toast({
        title: "Thành công",
        description: "Import lịch làm việc thành công",
        variant: 'default',
      });
      
      // Refresh schedules after import
      await refreshSchedules();
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('excel-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error('Error importing Excel:', error);
      console.error('Error details:', error?.response?.data);
      
      let errorMessage = 'Không thể import file Excel';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        // Kiểm tra cấu trúc lỗi từ backend
        if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors.map((err: any) => err.error).join(', ');
          errorMessage = validationErrors;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setImportLoading(false);
    }
  }, [selectedFile, getUserIdFromLocalStorage, toast, refreshSchedules]);

  // Handle download template
  const handleDownloadTemplate = useCallback(async () => {
    setDownloadLoading(true);
    try {
      await adminService.downloadScheduleTemplate();
      
      toast({
        title: "Thành công",
        description: "Template Excel đã được tải xuống",
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Error downloading template:', error);
      console.error('Error details:', error?.response?.data);
      
      let errorMessage = 'Không thể tải template Excel';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors.map((err: any) => err.error).join(', ');
          errorMessage = validationErrors;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setDownloadLoading(false);
    }
  }, [toast]);

  const getScheduleForDay = useCallback((day: string, timeSlotId: string) => {
    return apiSchedules.filter(schedule => {
      if (!schedule || !schedule.date) return false;
      const scheduleDate = formatDateFromAPI(schedule.date);
      return scheduleDate === day && schedule.timeSlotId === timeSlotId;
    });
  }, [apiSchedules]);

  const getStaffName = useCallback((userId: string) => {
    const schedule = apiSchedules.find(s => s.userId === userId);
    return schedule ? schedule.userName : 'Chưa phân công';
  }, [apiSchedules]);

  const checkScheduleConflict = useCallback((day: string, timeSlotId: string, roomId: string) => {
    const daySchedules = getScheduleForDay(day, timeSlotId);
    return daySchedules.some(schedule => schedule.roomId === roomId);
  }, [getScheduleForDay]);

  const handleAddSchedule = useCallback(async (day: string, timeSlotId: string, userId: string, roomId: string) => {
    try {
      if (checkScheduleConflict(day, timeSlotId, roomId)) {
        const timeSlot = timeSlots.find(ts => ts.id === timeSlotId);
        toast({
          title: "Xung đột lịch làm việc",
          description: `Phòng này đã có người làm việc trong ${timeSlot?.name || timeSlotId} này`,
          variant: 'warning',
        });
        return false;
      }

      const scheduleData = {
        userId,
        roomId,
        timeSlotId,
        date: formatDateForAPI(day)
      };

      console.log('Creating schedule:', scheduleData);
      await addScheduleAPI(scheduleData);

      // Don't show toast here - realtime will handle it
      return true;
    } catch (error) {
      const message = error?.response?.data?.Message || error?.message || "Không thể thêm lịch làm việc";
      console.error('Error adding schedule:', error);
      toast({
        title: "Lỗi",
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  }, [checkScheduleConflict, timeSlots, toast, addScheduleAPI]);

  const handleRemoveScheduleConfirm = useCallback((scheduleId: string) => {
    setDeletingScheduleId(scheduleId);
  }, []);

  const handleRemoveSchedule = useCallback(async () => {
    if (!deletingScheduleId) return;
    setDeleteLoading(true);
    try {
      await removeScheduleAPI(deletingScheduleId);
      // Don't show toast here - realtime will handle it
      setDeletingScheduleId(null);
      // Don't refresh manually - realtime will handle it
    } catch (error) {
      const message = error?.response?.data?.Message || error?.message || "Không thể xóa lịch làm việc";
      console.error('Error deleting schedule:', error);
      toast({
        title: "Lỗi",
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  }, [deletingScheduleId, removeScheduleAPI, toast]);

  const handleEditClick = useCallback((schedule: any) => {
    setEditingSchedule(schedule);
    setEditRoomId(schedule.roomId);
    setEditTimeSlotId(schedule.timeSlotId);
    setEditStatus(schedule.status || 'SCHEDULED');
    setSelectedDay(null);
    setSelectedShift(null);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editingSchedule) return;
    setEditLoading(true);
    try {
      const updateData = {
        userId: editingSchedule.userId,
        roomId: editRoomId,
        timeSlotId: editTimeSlotId,
        date: formatDateForAPI(formatDateFromAPI(editingSchedule.date)),
        status: editStatus,
      };

      await adminService.updateSchedule(editingSchedule.id, updateData);
      // Don't show toast here - realtime will handle it
      setEditingSchedule(null);
      // Don't refresh manually - realtime will handle it
    } catch (err) {
      const message = err?.response?.data?.Message || err?.message || "Không thể cập nhật lịch làm việc.";
      console.error('Error updating schedule:', err);
      toast({ 
        title: 'Lỗi', 
        description: message, 
        variant: 'destructive',
      });
    } finally {
      setEditLoading(false);
    }
  }, [editingSchedule, editRoomId, editTimeSlotId, editStatus, toast]);

  // Load time slots from API
  useEffect(() => {
    const loadTimeSlots = async () => {
      try {
        setLoading(true);
        const data = await adminService.getTimeSlots();
        console.log('Time slots:', data);
        setTimeSlots(data);
      } catch (error) {
        const message = error?.response?.data?.Message || error?.message || "Không thể tải danh sách ca làm việc";
        console.error('Error loading time slots:', error);
        toast({
          title: "Lỗi tải dữ liệu",
          description: message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadTimeSlots();
  }, [toast]);

  // Consolidated data loading effect with debounce
  useEffect(() => {
    // Debounce to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      const loadAllData = async () => {
        try {
          const { role, fromDate, toDate } = getCurrentScheduleParams();
          const paramsKey = `${role}-${fromDate}-${toDate}`;
          
          // Validate date range
          const fromDateObj = new Date(fromDate);
          const toDateObj = new Date(toDate);
          
          if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
            console.error('Invalid date range:', { fromDate, toDate });
            toast({
              title: "Lỗi ngày tháng",
              description: "Khoảng thời gian không hợp lệ",
              variant: 'destructive',
            });
            return;
          }
          
          if (fromDateObj > toDateObj) {
            console.error('Invalid date range: fromDate > toDate:', { fromDate, toDate });
            toast({
              title: "Lỗi ngày tháng", 
              description: "Ngày bắt đầu không thể sau ngày kết thúc",
              variant: 'destructive',
            });
            return;
          }
          
          // Only load if parameters changed
          if (currentParamsRef.current !== paramsKey) {
            console.log(`Loading schedules for ${role} from ${fromDate} to ${toDate}`);
            
            // Load schedules and statistics in parallel
            const [scheduleResult] = await Promise.allSettled([
              loadSchedulesByRole(role, fromDate, toDate),
              (async () => {
                try {
                  setStatsLoading(true);
                  const data = await adminService.getScheduleStatistics(role);
                  setStatistics(data);
                } catch (err) {
                  console.error('Error loading statistics:', err);
                  setStatistics(null);
                } finally {
                  setStatsLoading(false);
                }
              })()
            ]);
            
            if (scheduleResult.status === 'rejected') {
              throw new Error(scheduleResult.reason);
            }
            
            currentParamsRef.current = paramsKey;
            hasLoadedRef.current = true;
          } else {
            console.log('Skipping load - same parameters:', paramsKey);
          }
        } catch (error) {
          const message = error?.response?.data?.Message || error?.message || "Không thể tải dữ liệu";
          console.error('Error loading data:', error);
          toast({
            title: "Lỗi tải dữ liệu",
            description: message,
            variant: 'destructive',
          });
        }
      };

      loadAllData();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [activeTab, selectedWeek, selectedMonth, viewMode, getCurrentScheduleParams, loadSchedulesByRole, toast]);

  // Fetch staff & room options when open modal
  useEffect(() => {
    const fetchStaffAndRooms = async () => {
      if (!selectedDay || !selectedShift) return;
      try {
        let staffRole = '';
        if (activeTab === 'doctors') staffRole = 'DOCTOR';
        else if (activeTab === 'technicians') staffRole = 'TECHNICIAN';
        else if (activeTab === 'nurses') staffRole = 'NURSE';
        
        const staffList = await adminService.getUsersByRole(staffRole);
        setStaffOptions(staffList);
        
        if (activeTab === 'doctors') {
          const rooms = await adminService.getExaminationRoomsActive();
          setRoomOptions(rooms);
        } else if (activeTab === 'technicians') {
          const rooms = await adminService.getLaboratoryRoomsActive();
          setRoomOptions(rooms);
        } else if (activeTab === 'nurses') {
          const examRooms = await adminService.getExaminationRoomsActive();
          const labRooms = await adminService.getLaboratoryRoomsActive();
          setRoomOptions([...examRooms, ...labRooms]);
        }
      } catch (err) {
        const message = err?.response?.data?.Message || err?.message || 'Không thể tải danh sách nhân viên hoặc phòng';
        console.error('Error loading staff and rooms:', err);
        setStaffOptions([]);
        setRoomOptions([]);
        toast({
          title: 'Lỗi',
          description: message,
          variant: 'destructive',
        });
      }
    };
    fetchStaffAndRooms();
  }, [selectedDay, selectedShift, activeTab, toast]);

  // Fetch room options when editing
  useEffect(() => {
    const fetchRoomsForEdit = async () => {
      if (!editingSchedule) return;
      try {
        if (activeTab === 'doctors') {
          const rooms = await adminService.getExaminationRooms();
          setRoomOptions(rooms);
        } else if (activeTab === 'technicians') {
          const rooms = await adminService.getLaboratoryRooms();
          setRoomOptions(rooms);
        } else if (activeTab === 'nurses') {
          const examRooms = await adminService.getExaminationRooms();
          const labRooms = await adminService.getLaboratoryRooms();
          setRoomOptions([...examRooms, ...labRooms]);
        }
      } catch (err) {
        const message = err?.response?.data?.Message || err?.message || 'Không thể tải danh sách phòng';
        console.error('Error loading rooms for edit:', err);
        setRoomOptions([]);
        toast({
          title: 'Lỗi',
          description: message,
          variant: 'destructive',
        });
      }
    };
    fetchRoomsForEdit();
  }, [editingSchedule, activeTab, toast]);

  if (loading || scheduleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinic-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
        <div>
              <h1 className="text-2xl font-poppins font-bold text-clinic-navy">
            Quản lý lịch làm việc
          </h1>
        </div>

            {/* Role Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('doctors')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'doctors'
                    ? 'bg-white text-clinic-navy shadow-sm'
                    : 'text-gray-600 hover:text-clinic-navy'
                }`}
              >
                <User size={14} />
                <span>Bác sĩ</span>
              </button>
              <button
                onClick={() => setActiveTab('technicians')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'technicians'
                    ? 'bg-white text-clinic-navy shadow-sm'
                    : 'text-gray-600 hover:text-clinic-navy'
                }`}
              >
                <Users size={14} />
                <span>KTV</span>
              </button>
              <button
                onClick={() => setActiveTab('nurses')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'nurses'
                    ? 'bg-white text-clinic-navy shadow-sm'
                    : 'text-gray-600 hover:text-clinic-navy'
                }`}
              >
                <Heart size={14} />
                <span>Y tá</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">

            {/* Import Excel Button */}
            <div className="flex items-center space-x-2">
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => document.getElementById('excel-file-input')?.click()}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                <Upload size={14} />
                <span>Chọn file Excel</span>
              </button>
              {selectedFile && (
                <button
                  onClick={handleImportExcel}
                  disabled={importLoading}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-clinic-blue text-white rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {importLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Upload size={14} />
                  )}
                  <span>{importLoading ? 'Đang import...' : 'Import'}</span>
                </button>
              )}
              {selectedFile && (
                <span className="text-xs text-gray-600">
                  {selectedFile.name}
                </span>
              )}
            </div>

            {/* Download Template Button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadTemplate}
                disabled={downloadLoading}
                className="flex items-center space-x-1 px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {downloadLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                ) : (
                  <Download size={14} />
                )}
                <span>{downloadLoading ? 'Đang tải...' : 'Tải template'}</span>
              </button>
            </div>

            {/* View Mode */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-2.5 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white text-clinic-navy shadow-sm'
                    : 'text-gray-600 hover:text-clinic-navy'
                }`}
              >
                Tuần
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-2.5 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white text-clinic-navy shadow-sm'
                    : 'text-gray-600 hover:text-clinic-navy'
                }`}
              >
                Tháng
              </button>
            </div>

            {/* Date Picker */}
            {viewMode === 'week' ? (
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => {
                const newWeek = e.target.value;
                if (newWeek && newWeek.match(/^\d{4}-W\d{2}$/)) {
                  setSelectedWeek(newWeek);
                } else {
                  console.error('Invalid week format:', newWeek);
                }
              }}
              className="px-2.5 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            />
            ) : (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  const newMonth = e.target.value;
                  if (newMonth && newMonth.match(/^\d{4}-\d{2}$/)) {
                    setSelectedMonth(newMonth);
                  } else {
                    console.error('Invalid month format:', newMonth);
                  }
                }}
                className="px-2.5 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              />
            )}
          </div>
        </div>
      </div>

      {/* Statistics Section on top */}
      <div className="px-6 pt-4 pb-2 space-y-2">
        {/* API Statistics */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mt-2">
          <h3 className="text-lg font-semibold text-clinic-navy mb-2">Thống kê tổng hợp</h3>
          {statsLoading ? (
            <div className="text-gray-500 text-sm">Đang tải...</div>
          ) : statistics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-xl font-bold text-clinic-navy">{statistics.totalDoctors ?? statistics.totalTechnicians ?? statistics.totalNurses ?? 0}</div>
                <div className="text-xs text-gray-600">Tổng {getStaffTypeName()}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-clinic-navy">{statistics.totalRooms}</div>
                <div className="text-xs text-gray-600">Tổng phòng</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-clinic-navy">{statistics.totalShifts}</div>
                <div className="text-xs text-gray-600">Tổng ca</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-clinic-navy">{statistics.shiftsPerDay}</div>
                <div className="text-xs text-gray-600">Ca/ngày</div>
              </div>
            </div>
          ) : (
            <div className="text-red-500 text-sm">Không có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Schedule Grid - Takes all width */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
            {viewMode === 'week' ? (
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 p-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-clinic-navy">
                    Lịch tuần - {activeTab === 'doctors' ? 'Bác sĩ' : activeTab === 'technicians' ? 'KTV' : 'Y tá'}
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({currentWeekRange.start} - {currentWeekRange.end})
                    </span>
        </h2>
        </div>
                <div className="flex-1 overflow-auto">
                  <Table className="min-w-full">
                    <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                        <TableHead className="w-28 bg-white text-xs">Thời gian</TableHead>
                        {weekDays.map((day) => (
                          <TableHead key={day.id} className="text-center min-w-28 bg-white text-xs">
                            <div className="p-1">
                      <div className="font-semibold">{day.name}</div>
                      <div className="text-xs text-gray-500">{day.date}</div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
                      {timeSlots.map(timeSlot => (
                        <TableRow key={timeSlot.id}>
                          <TableCell className="font-medium sticky left-0 bg-white z-10 p-2">
                            <div className="flex items-center space-x-1">
                            <Clock size={12} className="text-clinic-navy" />
                            <div>
                                <div className="font-semibold text-clinic-navy text-xs">{timeSlot.name}</div>
                                <div className="text-xs text-gray-500">{timeSlot.startTime} - {timeSlot.endTime}</div>
                            </div>
                          </div>
                        </TableCell>
                        {weekDays.map(day => (
                            <TableCell key={`${day.id}-${timeSlot.id}`} className="p-1">
                            <div className="space-y-1">
                                <div className="space-y-1 min-h-[50px]">
                                  {getScheduleForDay(day.date, timeSlot.id).map((schedule, index) => (
                                    <StaffItem
                                      key={`${schedule.id}-${index}`}
                                      schedule={schedule}
                                      onRemove={handleRemoveScheduleConfirm}
                                      getStaffName={getStaffName}
                                      onClick={() => handleEditClick(schedule)}
                                    />
                                  ))}
                                </div>

                        <button
                          onClick={() => {
                                    setSelectedDay(day.date);
                                    setSelectedShift(timeSlot.id);
                          }}
                                className="w-full flex items-center justify-center space-x-1 p-1 border border-dashed border-gray-300 rounded text-gray-500 hover:border-clinic-blue hover:text-clinic-blue transition-colors"
                        >
                                <Plus size={12} />
                          <span className="text-xs">Thêm</span>
                        </button>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
              </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 p-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-clinic-navy">
                    Lịch tháng - {activeTab === 'doctors' ? 'Bác sĩ' : activeTab === 'technicians' ? 'KTV' : 'Y tá'}
                  </h2>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-3">
                  {timeSlots.map(timeSlot => (
                    <div key={timeSlot.id} className="space-y-2">
                      <div className="flex items-center space-x-2 p-2">
                        <Clock size={14} className="text-clinic-navy" />
                        <div>
                          <div className="font-semibold text-clinic-navy text-sm">{timeSlot.name}</div>
                          <div className="text-xs text-gray-500">{timeSlot.startTime} - {timeSlot.endTime}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(dayName => (
                          <div key={dayName} className="p-1 text-center text-xs font-medium text-gray-600 bg-gray-50 rounded">
                            {dayName}
                          </div>
                        ))}
                        
                        {monthDays.map((day) => (
                          <div key={day.id} className={`min-h-20 p-1 ${day.isEmpty ? 'bg-gray-50' : 'bg-white border border-gray-200'}`}>
                            {!day.isEmpty && (
                              <>
                                <div className="text-xs text-gray-500 mb-1">
                                  {day.dayNumber}
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="space-y-1">
                                    {getScheduleForDay(day.date, timeSlot.id).map((schedule, index) => (
                                      <div
                                        key={`${schedule.id}-${index}`}
                                        className="flex items-center justify-between p-1 bg-clinic-blue rounded text-xs cursor-pointer hover:bg-blue-600 transition-colors"
                                        onClick={() => handleEditClick(schedule)}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-clinic-navy truncate text-xs">
                                            {getStaffName(schedule.userId)}
                                          </div>
                                          <div className="flex items-center space-x-1 text-clinic-navy">
                                            <Building size={8} />
                                            <span className="truncate text-xs">{schedule.roomName}</span>
                                          </div>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveScheduleConfirm(schedule.id);
                                          }}
                                          className="text-red-600 hover:bg-red-50 p-0.5 rounded ml-1"
                                        >
                                          <X size={8} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>

                                  <button
                                    onClick={() => {
                                      setSelectedDay(day.date);
                                      setSelectedShift(timeSlot.id);
                                    }}
                                    className="w-full flex items-center justify-center space-x-1 p-1 border border-dashed border-gray-300 rounded text-gray-500 hover:border-clinic-blue hover:text-clinic-blue transition-colors text-xs"
                                  >
                                    <Plus size={8} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Staff Assignment Modal */}
      {selectedDay && selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-clinic-navy mb-3">
              Phân công {getStaffTypeName()}
            </h3>
            <p className="text-gray-600 mb-3 text-sm">
              {viewMode === 'week' 
                ? weekDays.find(d => d.date === selectedDay)?.name 
                : monthDays.find(d => d.date === selectedDay)?.name
              } - {timeSlots.find(ts => ts.id === selectedShift)?.name}
            </p>

            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertTriangle size={14} />
                <span className="text-sm font-medium">Lưu ý:</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Mỗi phòng chỉ có thể có một {getStaffTypeName()} trong một ca làm việc.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn {getStaffTypeName()}
                </label>
                <select
                  id="staff-select"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staffOptions
                    .filter(staff => {
                      // Lấy danh sách userId đã có lịch làm việc tại selectedDay + selectedShift
                      const scheduledUserIds = getScheduleForDay(selectedDay, selectedShift).map(s => s.userId);
                      return !scheduledUserIds.includes(staff.id);
                    })
                    .map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} - {staff.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn phòng
                </label>
                <select
                  id="room-select"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                >
                  <option value="">-- Chọn phòng --</option>
                  {roomOptions.map(room => {
                    const isOccupied = checkScheduleConflict(selectedDay, selectedShift, room.id);
                    return (
                      <option
                        key={room.id}
                        value={room.id}
                        disabled={isOccupied}
                        className={isOccupied ? 'text-gray-400' : ''}
                      >
                        {room.name} {isOccupied ? '(Đã có người)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setSelectedShift(null);
                }}
                className="px-3 py-1.5 text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  const staffSelect = document.getElementById('staff-select') as HTMLSelectElement;
                  const roomSelect = document.getElementById('room-select') as HTMLSelectElement;

                  if (staffSelect.value && roomSelect.value) {
                    const success = await handleAddSchedule(selectedDay, selectedShift, staffSelect.value, roomSelect.value);
                    if (success) {
                      setSelectedDay(null);
                      setSelectedShift(null);
                      // Don't refresh manually - realtime will handle it
                    }
                  }
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-clinic-blue text-white rounded text-sm hover:bg-blue-600"
              >
                <Save size={14} />
                <span>Lưu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-clinic-navy mb-3">Cập nhật lịch làm việc</h3>
            <p className="text-gray-600 mb-3 text-sm">
              {getStaffName(editingSchedule.userId)} - {timeSlots.find(ts => ts.id === editingSchedule.timeSlotId)?.name}
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn phòng</label>
                <select
                  value={editRoomId}
                  onChange={e => setEditRoomId(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                >
                  {roomOptions.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn ca làm</label>
                <select
                  value={editTimeSlotId}
                  onChange={e => setEditTimeSlotId(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                >
                  {timeSlots.map(ts => (
                    <option key={ts.id} value={ts.id}>{ts.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                >
                  <option value="SCHEDULED">Đã lên lịch</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setEditingSchedule(null)}
                className="px-3 py-1.5 text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleEditSave}
                className="flex items-center space-x-1 px-3 py-1.5 bg-clinic-blue text-white rounded text-sm hover:bg-blue-600"
                disabled={editLoading}
              >
                {editLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div> : <Save size={14} />}
                <span>Cập nhật</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {deletingScheduleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-clinic-navy mb-3">Xác nhận xóa</h3>
            <p className="mb-4 text-sm">Bạn có chắc chắn muốn xóa lịch làm việc này không?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeletingScheduleId(null)}
                className="px-3 py-1.5 text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50"
                disabled={deleteLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleRemoveSchedule}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                disabled={deleteLoading}
              >
                {deleteLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div> : <X size={14} />}
                <span>Xóa</span>
              </button>
        </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;