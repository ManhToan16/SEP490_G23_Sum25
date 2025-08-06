import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Clock, User, Phone, Mail, PhoneCall, AlertCircle, ChevronLeft, ChevronRight, TestTube } from 'lucide-react';
import NurseLayout from '@/shared/components/layouts/NurseLayout';
import { useAuth } from '../../shared/hooks/business/useAuth';
import { appointmentService, VisitResponseDTO } from '../../shared/services/appointmentService';
import { adminService } from '../../shared/services/adminService';
import { signalRService } from '../../shared/services/signalRService';
import { useToast } from '@/shared/components/ui/use-toast';

const LabPatientQueue: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { user } = useAuth();
  const { toast } = useToast();

  // State management cho API data
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noScheduleMessage, setNoScheduleMessage] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomInfo, setCurrentRoomInfo] = useState<{id: string, name: string, description: string} | null>(null);
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // State cho real-time notifications
  const [realtimeNotification, setRealtimeNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);
  
  // State cho SignalR connection status
  const [signalRStatus, setSignalRStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  // Function để lấy thông tin phòng xét nghiệm từ laboratoryRoomId
  const getRoomInfo = async (roomId: string) => {
    try {
      const rooms = await appointmentService.getLaboratoryRooms();
      
      // API trả về: { statusCode: 200, success: true, message: "...", data: [{ items: [...], ... }] }
      if (rooms?.data && Array.isArray(rooms.data) && rooms.data[0]?.items) {
        const roomsArray = rooms.data[0].items;
        const room = roomsArray.find((r: any) => r.id === roomId);
        if (room) {
          setCurrentRoomInfo({
            id: room.id,
            name: room.name,
            description: room.description
          });
        } else {
          setCurrentRoomInfo(null);
        }
      } else {
        setCurrentRoomInfo(null);
      }
    } catch (error: any) {
      setCurrentRoomInfo(null);
    }
  };

  // Function để fetch nurse schedule và assignments cho phòng xét nghiệm
  const fetchLabScheduleAndAssignments = useCallback(async (date: string) => {
    // Lấy userId từ token (field UserId)
    const userId = user?.UserId || user?.id;
    if (!userId) {
      setError('Không tìm thấy thông tin y tá');
      return;
    }

    setLoading(true);
    setError(null);
    setNoScheduleMessage(null);
    setAssignments([]);
    setCurrentRoomId(null);
    setCurrentRoomInfo(null);
    setCurrentPage(1); // Reset về trang đầu khi fetch dữ liệu mới

    try {
      // Bước 1: Gọi getByUserSchedule để lấy schedule của y tá để biết y tá làm ở phòng xét nghiệm nào
      
      const scheduleResponse = await appointmentService.getByUserSchedule(userId, {
        fromDate: date,
        toDate: date
      });

      // Kiểm tra xem có schedule không
      if (!scheduleResponse?.data || scheduleResponse.data.length === 0) {
        setNoScheduleMessage('Bạn không có lịch làm cho ca này');
        setLoading(false);
        return;
      }

      // Lấy laboratoryRoomId từ schedule đầu tiên (giả sử y tá chỉ có 1 schedule trong ngày)
      const schedule = scheduleResponse.data[0];
      const laboratoryRoomId = schedule.laboratoryRoomId || schedule.roomId; // Có thể là laboratoryRoomId hoặc roomId
      
      if (!laboratoryRoomId) {
        setError('Không tìm thấy thông tin phòng xét nghiệm trong lịch làm việc');
        setLoading(false);
        return;
      }

      setCurrentRoomId(laboratoryRoomId);

      // Bước 1.5: Lấy thông tin chi tiết phòng xét nghiệm
      await getRoomInfo(laboratoryRoomId);

      // Bước 2: Gọi getAssignmentsByRoomAndDate để lấy danh sách assignments sử dụng laboratoryRoomId từ bước 1
      const assignmentsResponse = await appointmentService.getAssignmentsByRoomAndDate({
        laboratoryRoomId: laboratoryRoomId, // Sử dụng laboratoryRoomId từ bước 1
        date: date,
        pageNumber: 1,
        pageSize: 100 // Lấy nhiều để đảm bảo không bị thiếu
      });

      if (assignmentsResponse?.data) {
        // API trả về: { statusCode: 200, success: true, message: "...", data: [{ items: [...], pageNumber: 1, ... }] }
        // assignmentsResponse.data là array chứa PaginatedResponse
        const dataArray = assignmentsResponse.data;
        
        if (Array.isArray(dataArray) && dataArray.length > 0) {
          const paginatedData = dataArray[0]; // Lấy phần tử đầu tiên
          
          if (paginatedData?.items && Array.isArray(paginatedData.items)) {
            setAssignments(paginatedData.items);
          } else {
            setAssignments([]);
          }
        } else {
          setAssignments([]);
        }
      } else {
        setAssignments([]);
      }

    } catch (error: any) {
      setError(error?.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // useEffect để gọi API khi component mount hoặc khi selectedDate thay đổi
  useEffect(() => {
    
    // Lấy userId từ user.UserId (từ token) hoặc user.id
    const userId = user?.UserId || user?.id;
    
    if (userId) {
      fetchLabScheduleAndAssignments(selectedDate);
    }
  }, [user, selectedDate, fetchLabScheduleAndAssignments]);

  // SignalR real-time updates cho AssignmentChanged events
  useEffect(() => {
    
    const handleAssignmentChanged = (assignmentData: any) => {
      
      // Normalize data structure - backend sends camelCase, we expect PascalCase
      const normalizedData = {
        Action: assignmentData.action || assignmentData.Action,
        AssignmentId: assignmentData.assignmentId || assignmentData.AssignmentId,
        PatientName: assignmentData.patientName || assignmentData.PatientName,
        LaboratoryRoomId: assignmentData.laboratoryRoomId || assignmentData.LaboratoryRoomId,
        Status: assignmentData.status || assignmentData.Status
      };
      
      // Chỉ xử lý nếu assignment thuộc về phòng xét nghiệm hiện tại
      if (normalizedData.LaboratoryRoomId === currentRoomId) {
        
        if (normalizedData.Action === 'CREATE') {
          // Thêm assignment mới vào danh sách
          const newAssignment = {
            id: normalizedData.AssignmentId,
            visitId: normalizedData.AssignmentId, // Sử dụng AssignmentId làm visitId
            patientName: normalizedData.PatientName,
            patientProfileId: 'N/A', // Backend không gửi patientProfileId
            queueNumber: Math.floor(Math.random() * 100) + 1, // Fallback random number
            status: normalizedData.Status,
            isPrioritized: false,
            assignmentId: normalizedData.AssignmentId
          };
          setAssignments(prev => [newAssignment, ...prev]);
          
          // Hiển thị thông báo real-time
          setRealtimeNotification({
            show: true,
            message: `🆕 Bệnh nhân mới: ${normalizedData.PatientName} - ${normalizedData.Status}`,
            type: 'info'
          });
          
          // Tự động ẩn thông báo sau 5 giây
          setTimeout(() => setRealtimeNotification(null), 5000);
        } else if (normalizedData.Action === 'UPDATE') {
          // Cập nhật assignment trong danh sách
          setAssignments(prev => prev.map(assignment => 
            assignment.id === normalizedData.AssignmentId 
              ? { ...assignment, status: normalizedData.Status }
              : assignment
          ));
          
          // Hiển thị thông báo real-time
          setRealtimeNotification({
            show: true,
            message: `🔄 Cập nhật: ${normalizedData.PatientName} - ${normalizedData.Status}`,
            type: 'success'
          });
          
          // Tự động ẩn thông báo sau 5 giây
          setTimeout(() => setRealtimeNotification(null), 5000);
        }
      }
    };

    // Đăng ký listener
    signalRService.on('assignmentChanged', handleAssignmentChanged);
    
    // Theo dõi connection status
    const checkConnectionStatus = () => {
      if (signalRService.isConnected()) {
        setSignalRStatus('connected');
      } else {
        setSignalRStatus('disconnected');
      }
    };
    
    // Kiểm tra status ban đầu
    checkConnectionStatus();
    
    // Đảm bảo SignalR connection được khởi tạo
    setSignalRStatus('connecting');
    signalRService.startConnection().then(() => {
      setSignalRStatus('connected');
    }).catch(() => {
      setSignalRStatus('disconnected');
    });
    
    // Theo dõi connection status định kỳ
    const statusInterval = setInterval(checkConnectionStatus, 5000);
    
    // Cleanup khi component unmount
    return () => {
      signalRService.off('assignmentChanged', handleAssignmentChanged);
      clearInterval(statusInterval);
    };
  }, [currentRoomId]);

  // Convert assignments to visits format for compatibility with existing UI
  const convertAssignmentsToVisits = (assignments: any[]) => {
    return assignments.map((assignment: any) => ({
      visitId: assignment.visitId || assignment.id,
      patientName: assignment.patientName || 'N/A',
      patientProfileId: assignment.patientProfileId || assignment.patientId || 'N/A',
      queueNumber: assignment.queueNumber || Math.floor(Math.random() * 100) + 1, // Fallback random number
      status: assignment.status || 'WAITING',
      isPrioritized: assignment.isPrioritized || false,
      assignmentId: assignment.assignmentId || assignment.id
    }));
  };

  // Use assignments data instead of visits
  const visits = convertAssignmentsToVisits(assignments);

  // Logic phân trang
  const totalPages = Math.ceil(visits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVisits = visits.slice(startIndex, endIndex);

  // Functions cho phân trang
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };



  const handleCallPatient = async (visit: any) => {
    try {
      
      // Gọi API updateAssignmentCalling để cập nhật trạng thái
      const response = await appointmentService.updateAssignmentCalling(visit.assignmentId);
      
      // Hiển thị thông báo thành công bằng toast
      toast({
        title: "Thành công!",
        description: `Đã gọi bệnh nhân: ${visit.patientName} đến phòng xét nghiệm`,
        variant: "success",
      });
      
      // Refresh lại danh sách để cập nhật trạng thái mới
      await fetchLabScheduleAndAssignments(selectedDate);
      
    } catch (error: any) {
      toast({
        title: "Lỗi!",
        description: 'Có lỗi xảy ra khi gọi bệnh nhân: ' + (error?.message || 'Unknown error'),
        variant: "destructive",
      });
    }
  };



  return (
    <NurseLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
              Hàng chờ bệnh nhân phòng xét nghiệm
            </h1>
            <p className="text-gray-600">
              Quản lý danh sách bệnh nhân chờ xét nghiệm hôm nay
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* SignalR Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                signalRStatus === 'connected' ? 'bg-green-500' :
                signalRStatus === 'connecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                signalRStatus === 'connected' ? 'text-green-600' :
                signalRStatus === 'connecting' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {signalRStatus === 'connected' ? 'Real-time kết nối' :
                 signalRStatus === 'connecting' ? 'Đang kết nối...' :
                 'Mất kết nối'}
              </span>
            </div>
            
            {/* Date Selector */}
            <div className="clinic-card min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn ngày xét nghiệm
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              />
            </div>
          </div>
        </div>

        {/* Real-time Notification */}
        {realtimeNotification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            realtimeNotification.type === 'success' 
              ? 'bg-green-100 border border-green-300 text-green-800' 
              : realtimeNotification.type === 'warning'
              ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
              : 'bg-blue-100 border border-blue-300 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="animate-pulse">🔔</div>
              <span className="font-medium">{realtimeNotification.message}</span>
              <button 
                onClick={() => setRealtimeNotification(null)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}


        {/* Waiting Queue */}
        <div className="clinic-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy">
              Danh sách bệnh nhân xét nghiệm
            </h2>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {assignments.length} bệnh nhân
              </span>
              {currentRoomInfo && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {currentRoomInfo.name}
                </span>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => fetchLabScheduleAndAssignments(selectedDate)}
                className="clinic-button-primary"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* No Schedule Message */}
          {noScheduleMessage && !loading && !error && (
            <div className="text-center py-8">
              <TestTube className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">{noScheduleMessage}</p>
            </div>
          )}

          {/* Visits Table */}
          {!loading && !error && !noScheduleMessage && (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-10 gap-4 px-6 py-4 bg-purple-50 rounded-t-lg border-b">
                  <div className="col-span-5 text-sm font-semibold text-clinic-navy">
                    Thông tin bệnh nhân
                  </div>
                  <div className="col-span-2 text-sm font-semibold text-clinic-navy">
                    Trạng thái
                  </div>
                  <div className="col-span-3 text-sm font-semibold text-clinic-navy text-center">
                    Thao tác
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                  {currentVisits.map((visit, index) => (
                    <div key={visit.visitId} className="grid grid-cols-10 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      {/* Patient Info */}
                      <div className="col-span-5 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center">
                          <User className="text-white" size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-clinic-navy text-lg">
                            {visit.patientName || 'N/A'}
                          </h4>
                          {visit.isPrioritized && (
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium mt-1">
                              Ưu tiên
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex items-center">
                        <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                          visit.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          visit.status === 'WAITING_FOR_CHECK_IN' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          visit.status === 'WAITING_FOR_CONFIRMATION' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          visit.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800 border border-green-200' :
                          visit.status === 'PENDING' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          visit.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          visit.status === 'IN_EXAMINATION_PROGRESS' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          visit.status === 'IN_LABORATORY' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          visit.status === 'IN_LABORATORY_PROGRESS' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                          visit.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-200' :
                          visit.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border border-red-200' :
                          visit.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                          visit.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          visit.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          visit.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {visit.status === 'WAITING' ? 'Đang chờ' :
                           visit.status === 'WAITING_FOR_CHECK_IN' ? 'Chờ check-in' :
                           visit.status === 'WAITING_FOR_CONFIRMATION' ? 'Chờ xác nhận' :
                           visit.status === 'CHECKED_IN' ? 'Đã check-in' :
                           visit.status === 'PENDING' ? 'Đang chờ thanh toán' :
                           visit.status === 'IN_PROGRESS' ? 'Đang xét nghiệm' :
                           visit.status === 'IN_EXAMINATION_PROGRESS' ? 'Đang khám' :
                           visit.status === 'IN_LABORATORY' ? 'Đang xét nghiệm' :
                           visit.status === 'IN_LABORATORY_PROGRESS' ? 'Đang xét nghiệm' :
                           visit.status === 'COMPLETED' ? 'Hoàn thành' :
                           visit.status === 'CANCELLED' ? 'Đã hủy' :
                           visit.status === 'scheduled' ? 'Đã lên lịch' :
                           visit.status === 'in-progress' ? 'Đang thực hiện' :
                           visit.status === 'completed' ? 'Hoàn thành' :
                           visit.status === 'cancelled' ? 'Đã hủy' :
                           visit.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 flex items-center justify-center">
                        {visit.status === 'WAITING' && (
                          <button 
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            onClick={() => handleCallPatient(visit)}
                          >
                            <TestTube size={16} />
                            <span>Gọi xét nghiệm</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {assignments.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TestTube className="text-purple-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chưa có bệnh nhân nào
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Hiện tại chưa có bệnh nhân nào đang chờ xét nghiệm trong ngày được chọn
                  </p>
                </div>
              )}

              {/* Pagination */}
              {visits.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-b-lg border-t">
                  <div className="text-sm text-gray-600">
                    Hiển thị <span className="font-semibold text-clinic-navy">{startIndex + 1}</span> - <span className="font-semibold text-clinic-navy">{Math.min(endIndex, visits.length)}</span> trong tổng số <span className="font-semibold text-clinic-navy">{visits.length}</span> bệnh nhân
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed bg-gray-200'
                          : 'text-clinic-navy bg-white hover:bg-purple-600 hover:text-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Trước
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'text-clinic-navy bg-white hover:bg-purple-600 hover:text-white shadow-sm hover:shadow-md'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed bg-gray-200'
                          : 'text-clinic-navy bg-white hover:bg-purple-600 hover:text-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      Sau
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </NurseLayout>
  );
};

export default LabPatientQueue;