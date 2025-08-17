import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Search, Filter, X } from "lucide-react";
import { appointmentService, Appointment } from "@/shared/services/appointmentService";
import { useToast } from "@/shared/components/ui/use-toast";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { signalRService } from "@/shared/services/signalRService";

const AppointmentPendingConfirm: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // State cho modal hủy lịch hẹn
  const [showCancelAppointmentModal, setShowCancelAppointmentModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingAppointment, setCancellingAppointment] = useState(false);
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState<Appointment | null>(null);

  // Fetch pending appointments from API
  const fetchPendingAppointments = useCallback(async () => {
    try {
      setLoading(true);
      
      const params: any = {
        pageNumber: currentPage,
        pageSize: pageSize,
        status: "WAITING_FOR_CONFIRMATION" // Chỉ lấy lịch hẹn chờ xác nhận
      };

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
      
      console.log('🔍 Raw pending appointments result:', result);
      
      if (result && result[0] && result[0].items) {
        console.log('🔍 Setting pending appointments:', result[0].items);
        setAppointments(result[0].items);
        setTotalItems(result[0].totalItems || 0);
      } else {
        setAppointments([]);
        setTotalItems(0);
      }
      
    } catch (error: any) {
      console.error('Error fetching pending appointments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách lịch hẹn chờ xác nhận",
        variant: 'destructive',
      });
      setAppointments([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, pageSize]);

  // Handle real-time appointment changes from SignalR
  const handleAppointmentChanged = useCallback((appointmentData: any) => {
    console.log('📋 Handling appointment change:', appointmentData);
    
    const { action, id, status } = appointmentData;
    
    // Only handle appointments that are relevant to this page (WAITING_FOR_CONFIRMATION)
    if (action === 'CREATE' && status === 'WAITING_FOR_CONFIRMATION') {
      // Add new pending appointment to the list
      setAppointments(prev => {
        // Check if appointment already exists to avoid duplicates
        const exists = prev.some(apt => apt.id === id);
        if (!exists) {
          console.log('➕ Adding new pending appointment:', appointmentData);
          return [appointmentData, ...prev];
        }
        return prev;
      });
      setTotalItems(prev => prev + 1);
      
      toast({
        title: "Lịch hẹn mới",
        description: `Có lịch hẹn mới từ ${appointmentData.name} cần xác nhận`,
      });
    } 
    else if (action === 'UPDATE') {
      setAppointments(prev => {
        const updatedAppointments = prev.map(apt => {
          if (apt.id === id) {
            // If status changed from WAITING_FOR_CONFIRMATION to something else, remove from list
            if (status !== 'WAITING_FOR_CONFIRMATION') {
              console.log('➖ Removing appointment from pending list:', appointmentData);
              return null;
            }
            // Otherwise update the appointment data
            console.log('🔄 Updating appointment:', appointmentData);
            return { ...apt, ...appointmentData };
          }
          return apt;
        }).filter(Boolean) as Appointment[];
        
        // Update total items if appointment was removed
        if (updatedAppointments.length < prev.length) {
          setTotalItems(prevTotal => Math.max(0, prevTotal - 1));
        }
        
        return updatedAppointments;
      });
    }
  }, [toast]);

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
    fetchPendingAppointments();
  }, [searchTerm, currentPage, pageSize, fetchPendingAppointments]);

  // Handle confirm appointment
  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.confirmAppointment(appointmentId);
      toast({
        title: "Thành công",
        description: "Đã xác nhận lịch hẹn",
      });
      fetchPendingAppointments(); // Refresh data
    } catch (error: any) {
      console.error('Error confirming appointment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận lịch hẹn",
        variant: 'destructive',
      });
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = async (appointment: Appointment) => {
    // Mở modal xác nhận hủy lịch hẹn
    setSelectedAppointmentForCancel(appointment);
    setShowCancelAppointmentModal(true);
  };

  const handleConfirmCancelAppointment = async () => {
    if (!selectedAppointmentForCancel) return;

    try {
      setCancellingAppointment(true);
      
      // Gọi API để hủy appointment với lý do
      await appointmentService.cancelAppointment(selectedAppointmentForCancel.id, cancelReason);
      
      toast({
        title: "Thành công",
        description: "Đã hủy lịch hẹn thành công",
      });
      
      // Đóng modal và reset form
      setShowCancelAppointmentModal(false);
      setCancelReason("");
      setSelectedAppointmentForCancel(null);
      
      // Refresh data
      fetchPendingAppointments();
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      
      // Lấy thông báo lỗi cụ thể từ response
      let errorMessage = "Không thể hủy lịch hẹn";
      
      if (error.response && error.response.data) {
        if (error.response.data.Message) {
          errorMessage = error.response.data.Message;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.Error) {
          errorMessage = error.response.data.Error;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setCancellingAppointment(false);
    }
  };

  const handleCloseCancelAppointmentModal = () => {
    setShowCancelAppointmentModal(false);
    setCancelReason("");
    setSelectedAppointmentForCancel(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING_FOR_CONFIRMATION":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "WAITING_FOR_CONFIRMATION":
        return "Chờ xác nhận";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Lịch Hẹn Chờ Xác Nhận
        </h1>
        <p className="text-gray-600">Quản lý và xác nhận lịch hẹn chờ duyệt</p>
      </div>

      {/* Search Filter */}
      <div className="clinic-card">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, email, số điện thoại..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="clinic-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Tên bệnh nhân
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Số điện thoại
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Ngày sinh
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Không có lịch hẹn chờ xác nhận
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => handleCancelAppointment(appointment)}
                        >
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                          onClick={() => handleConfirmAppointment(appointment.id)}
                        >
                          Xác nhận
                        </Button>
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

      {/* Modal xác nhận hủy lịch hẹn */}
      {showCancelAppointmentModal && selectedAppointmentForCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-clinic-navy">
                Xác nhận hủy lịch hẹn
              </h3>
              <button
                onClick={handleCloseCancelAppointmentModal}
                disabled={cancellingAppointment}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.
              </p>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Bệnh nhân:</strong> {selectedAppointmentForCancel.name}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Số điện thoại:</strong> {selectedAppointmentForCancel.phoneNumber || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Email:</strong> {selectedAppointmentForCancel.email || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Ngày sinh:</strong> {selectedAppointmentForCancel.dateOfBirth ? new Date(selectedAppointmentForCancel.dateOfBirth).toLocaleDateString("vi-VN") : 'N/A'}
                </div>
              </div>
              
              <div>
                <Label htmlFor="cancel-reason" className="text-sm font-medium text-gray-700">
                  Lý do hủy lịch hẹn *
                </Label>
                <textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy lịch hẹn..."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCloseCancelAppointmentModal}
                disabled={cancellingAppointment}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmCancelAppointment}
                disabled={cancellingAppointment || !cancelReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {cancellingAppointment ? "Đang hủy..." : "Xác nhận hủy"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPendingConfirm; 