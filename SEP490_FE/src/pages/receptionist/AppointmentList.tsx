import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, User, Search, Filter, X } from "lucide-react";
import { appointmentService, Appointment } from "@/shared/services/appointmentService";
import { useToast } from "@/shared/components/ui/use-toast";
import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router-dom";
import { signalRService } from "@/shared/services/signalRService";

const AppointmentList: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      
      const params: any = {
        pageNumber: currentPage,
        pageSize: pageSize
      };

      // Add filters
      if (selectedDate) params.date = selectedDate;
      if (statusFilter !== "all") params.status = statusFilter;
      
      // Add search filter if provided - search by name, phone, or email
      if (searchTerm) {
        // Tự động phát hiện loại tìm kiếm
        const trimmedSearch = searchTerm.trim();
        
        // Kiểm tra nếu là email (chứa @)
        if (trimmedSearch.includes('@')) {
          params.email = trimmedSearch;
        }
        // Kiểm tra nếu là số điện thoại (chỉ chứa số và một số ký tự đặc biệt)
        else if (/^[\d\s\-+()]+$/.test(trimmedSearch)) {
          params.phoneNumber = trimmedSearch;
        }
        // Mặc định tìm theo tên
        else {
          params.name = trimmedSearch;
        }
      }

      const result = await appointmentService.getAllAppointment(params);
      
      // result đã là data array từ API response
      if (result && result[0] && result[0].items) {
        setAppointments(result[0].items);
        setTotalItems(result[0].totalItems || 0);
      } else {
        setAppointments([]);
        setTotalItems(0);
      }
      
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách lịch hẹn",
        variant: 'destructive',
      });
      setAppointments([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, statusFilter, searchTerm, currentPage, pageSize, toast]);

  // Check if appointment matches current filters
  const appointmentMatchesFilters = useCallback((appointment: any) => {
    // Check date filter
    if (selectedDate) {
      const appointmentDate = new Date(appointment.date).toISOString().split("T")[0];
      if (appointmentDate !== selectedDate) {
        return false;
      }
    }

    // Check status filter
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }

    // Check search filter
    if (searchTerm) {
      const trimmedSearch = searchTerm.trim().toLowerCase();
      const name = (appointment.name || '').toLowerCase();
      const email = (appointment.email || '').toLowerCase();
      const phoneNumber = (appointment.phoneNumber || '').toLowerCase();
      
      if (trimmedSearch.includes('@')) {
        return email.includes(trimmedSearch);
      } else if (/^[\d\s\-+()]+$/.test(trimmedSearch)) {
        return phoneNumber.includes(trimmedSearch.replace(/[\s\-+()]/g, ''));
      } else {
        return name.includes(trimmedSearch);
      }
    }

    return true;
  }, [selectedDate, statusFilter, searchTerm]);

  // Handle real-time appointment changes from SignalR
  const handleAppointmentChanged = useCallback((appointmentData: any) => {
    console.log('📋 Handling appointment change in AppointmentList:', appointmentData);
    
    const { action, id } = appointmentData;
    
    if (action === 'CREATE') {
      // Only add if appointment matches current filters
      if (appointmentMatchesFilters(appointmentData)) {
        setAppointments(prev => {
          // Check if appointment already exists to avoid duplicates
          const exists = prev.some(apt => apt.id === id);
          if (!exists) {
            console.log('➕ Adding new appointment to list:', appointmentData);
            return [appointmentData, ...prev];
          }
          return prev;
        });
        setTotalItems(prev => prev + 1);
        
        toast({
          title: "Lịch hẹn mới",
          description: `Có lịch hẹn mới từ ${appointmentData.name}`,
        });
      }
    } 
    else if (action === 'UPDATE') {
      setAppointments(prev => {
        let appointmentFound = false;
        
        const updatedAppointments = prev.map(apt => {
          if (apt.id === id) {
            appointmentFound = true;
            // Merge existing appointment data with new data from SignalR
            const updatedAppointment = { ...apt, ...appointmentData };
            console.log('🔄 Updating appointment with ID:', id, updatedAppointment);
            
            // Always keep the appointment in the list, just update the data
            // This ensures appointments don't disappear when status changes
            return updatedAppointment;
          }
          return apt;
        });
        
        // If appointment was not found in current list but matches filters, add it
        if (!appointmentFound && appointmentMatchesFilters(appointmentData)) {
          console.log('➕ Adding updated appointment to list (now matches filters):', appointmentData);
          updatedAppointments.unshift(appointmentData);
          setTotalItems(prev => prev + 1);
        }
        
        return updatedAppointments;
      });
    }
  }, [appointmentMatchesFilters, toast]);

  // Setup SignalR connection and event listeners
  useEffect(() => {
    // Start SignalR connection
    signalRService.startConnection();
    
    // Subscribe to appointment changes
    signalRService.on('appointmentChanged', handleAppointmentChanged);
    
    // Cleanup on unmount
    return () => {
      signalRService.off('appointmentChanged', handleAppointmentChanged);
    };
  }, [handleAppointmentChanged]);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, statusFilter, searchTerm, currentPage, pageSize, fetchAppointments]);

  // Handle view appointment details
  const handleViewDetails = (appointment: Appointment) => {
    // Lưu appointment data vào sessionStorage để tránh phải gọi API lại
    sessionStorage.setItem('selectedAppointment', JSON.stringify(appointment));
    navigate(`/receptionist/appointments/${appointment.id}`);
  };

  // Handle check-in appointment
  const handleCheckInAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.checkInAppointment(appointmentId);
      toast({
        title: "Thành công",
        description: "Đã check-in lịch hẹn",
      });
      // fetchAppointments(); // Refresh data
    } catch (error: any) {
      console.error('Error checking in appointment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể check-in lịch hẹn",
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CHECKED_IN":
        return "bg-green-100 text-green-800";
      case "WAITING_FOR_CHECK_IN":
        return "bg-blue-100 text-blue-800";
      case "WAITING_FOR_CONFIRMATION":
        return "bg-orange-100 text-orange-800";
      case "IN_EXAMINATION_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING_WITHOUT_ASSIGNMENT":
        return "bg-yellow-100 text-yellow-800";
      case "IN_LABORATORY_PROGRESS":
        return "bg-indigo-100 text-indigo-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CHECKED_IN":
        return "Đã check-in";
      case "WAITING_FOR_CHECK_IN":
        return "Chờ check-in";
      case "WAITING_FOR_CONFIRMATION":
        return "Chờ xác nhận";
      case "IN_EXAMINATION_PROGRESS":
        return "Đang khám";
      case "PENDING":
        return "Đang chờ thanh toán";
      case "PENDING_WITHOUT_ASSIGNMENT":
        return "Đang chờ thanh toán";
      case "IN_LABORATORY_PROGRESS":
        return "Đang xét nghiệm";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Debug logs removed to reduce noise

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
              <option value="WAITING_FOR_CONFIRMATION">Chờ xác nhận</option>
              <option value="WAITING_FOR_CHECK_IN">Chờ check-in</option>
              <option value="CHECKED_IN">Đã check-in</option>
              <option value="IN_EXAMINATION_PROGRESS">Đang khám</option>
              <option value="PENDING">Đang chờ thanh toán</option>
              <option value="PENDING_WITHOUT_ASSIGNMENT">Đang chờ thanh toán</option>
              <option value="IN_LABORATORY_PROGRESS">Đang xét nghiệm</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
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
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  Tên bệnh nhân
                </th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                  Số điện thoại
                </th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                  Ngày sinh
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Không có lịch hẹn nào
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium text-clinic-navy">
                        {appointment.name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {appointment.phoneNumber || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {appointment.email || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {appointment.dateOfBirth ? new Date(appointment.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center space-x-2">
                        <button 
                          className="px-3 py-1 text-clinic-navy border border-clinic-navy rounded hover:bg-clinic-navy hover:text-white transition-colors text-sm"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          Chi tiết
                        </button>
                        {appointment.status === "WAITING_FOR_CHECK_IN" && (
                          <button 
                            className="px-3 py-1 bg-green-600 text-white border border-green-600 rounded hover:bg-green-700 transition-colors text-sm"
                            onClick={() => handleCheckInAppointment(appointment.id)}
                          >
                            Check-in
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > pageSize && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} của {totalItems} lịch hẹn
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Trước
              </Button>
              <span className="px-3 py-2 text-sm text-gray-600">
                Trang {currentPage} / {Math.ceil(totalItems / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage * pageSize >= totalItems}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AppointmentList;
