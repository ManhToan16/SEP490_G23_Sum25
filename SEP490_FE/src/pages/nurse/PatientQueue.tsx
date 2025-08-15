import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Clock, User, Phone, Mail, PhoneCall, Monitor, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import NurseLayout from '@/shared/components/layouts/NurseLayout';
import { useAuth } from '../../shared/hooks/business/useAuth';
import { appointmentService, VisitResponseDTO } from '../../shared/services/appointmentService';
import { adminService } from '../../shared/services/adminService';
import { signalRService } from '../../shared/services/signalRService';
import { useToast } from '@/shared/components/ui/use-toast';

const PatientQueue: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { user } = useAuth();
  const { toast } = useToast();

  // State management cho API data
  const [visits, setVisits] = useState<VisitResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noScheduleMessage, setNoScheduleMessage] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomInfo, setCurrentRoomInfo] = useState<{id: string, name: string, description: string} | null>(null);
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State cho SignalR status real-time
  const [signalRStatus, setSignalRStatus] = useState(signalRService.getConnectionState());

  // Function để lấy thông tin phòng khám từ roomId
  const getRoomInfo = async (roomId: string) => {
    try {
      const rooms = await adminService.getExaminationRooms();
      
      const room = rooms.find((r: any) => r.id === roomId);
      if (room) {
        setCurrentRoomInfo({
          id: room.id,
          name: room.name,
          description: room.description
        });
      } else {
        setCurrentRoomInfo(null);
      }
    } catch (error: any) {
      setCurrentRoomInfo(null);
    }
  };

  // Function để fetch nurse schedule và visits
  const fetchNurseScheduleAndVisits = useCallback(async (date: string) => {
    // Lấy userId từ token (field UserId)
    const userId = user?.UserId || user?.id;
    if (!userId) {
      setError('Không tìm thấy thông tin y tá');
      return;
    }

    setLoading(true);
    setError(null);
    setNoScheduleMessage(null);
    setVisits([]);
    setCurrentRoomId(null);
    setCurrentRoomInfo(null);
    setCurrentPage(1); // Reset về trang đầu khi fetch dữ liệu mới

    try {
      // Bước 1: Gọi getByUserSchedule để lấy schedule của y tá để biết y tá làm ở phòng nào
      
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

      // Lấy roomId từ schedule đầu tiên (giả sử y tá chỉ có 1 schedule trong ngày)
      const schedule = scheduleResponse.data[0];
      const roomId = schedule.roomId;
      
      if (!roomId) {
        setError('Không tìm thấy thông tin phòng khám trong lịch làm việc');
        setLoading(false);
        return;
      }

      setCurrentRoomId(roomId);

      // Bước 1.5: Lấy thông tin chi tiết phòng khám
      await getRoomInfo(roomId);

      // Bước 2: Gọi getVisitsByRoomAndDate để lấy danh sách visits sử dụng roomId từ bước 1
      const visitsResponse = await appointmentService.getVisitsByRoomAndDate({
        examinationRoomId: roomId, // Sử dụng roomId từ bước 1
        date: date,
        pageNumber: 1,
        pageSize: 100 // Lấy nhiều để đảm bảo không bị thiếu
      });

      if (visitsResponse?.data) {
        // API trả về: { statusCode: 200, success: true, message: "...", data: [{ items: [...], pageNumber: 1, ... }] }
        // visitsResponse.data là array chứa PaginatedResponse
        const dataArray = visitsResponse.data;
        
        if (Array.isArray(dataArray) && dataArray.length > 0) {
          const paginatedData = dataArray[0]; // Lấy phần tử đầu tiên
          
          if (paginatedData?.items && Array.isArray(paginatedData.items)) {
            setVisits(paginatedData.items);
          } else {
            setVisits([]);
          }
        } else {
          setVisits([]);
        }
      } else {
        setVisits([]);
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
      fetchNurseScheduleAndVisits(selectedDate);
    }
  }, [user, selectedDate, fetchNurseScheduleAndVisits]);

  // SignalR status monitoring
  useEffect(() => {
    const updateStatus = () => {
      setSignalRStatus(signalRService.getConnectionState());
    };

    // Update status every 2 seconds
    const statusInterval = setInterval(updateStatus, 2000);

    return () => clearInterval(statusInterval);
  }, []);

  // SignalR real-time updates
  useEffect(() => {
    
    // Start SignalR connection
    signalRService.startConnection();

    // Handle visit changes
    const handleVisitChanged = (visitData: any) => {
      
      // Normalize data structure - backend sends camelCase, we expect PascalCase
      const normalizedData = {
        Action: visitData.action || visitData.Action,
        VisitId: visitData.visitId || visitData.VisitId,
        PatientName: visitData.patientName || visitData.PatientName,
        ExaminationRoomId: visitData.examinationRoomId || visitData.ExaminationRoomId,
        QueueNumber: visitData.queueNumber || visitData.QueueNumber,
        Status: visitData.status || visitData.Status,
        IsPrioritized: visitData.isPrioritized || visitData.IsPrioritized
      };

      // Xử lý visit nếu thuộc về phòng khám hiện tại của y tá HOẶC nếu chưa có room filter
      const shouldProcess = !currentRoomId || normalizedData.ExaminationRoomId === currentRoomId;
      
      if (shouldProcess) {
        
        if (normalizedData.Action === 'CREATE') {
          // Thêm visit mới vào danh sách
          const newVisit: VisitResponseDTO = {
            visitId: normalizedData.VisitId,
            patientName: normalizedData.PatientName,
            patientProfileId: '', // Sẽ được cập nhật từ API nếu cần
            queueNumber: normalizedData.QueueNumber,
            status: normalizedData.Status,
            isPrioritized: normalizedData.IsPrioritized,
            assignedDoctorId: '',
            assignedDoctorName: '',
            examinationRoomId: normalizedData.ExaminationRoomId,
            examinationRoomName: currentRoomInfo?.name || '',
            appointmentId: '',
            totalPrice: 0
          };
          
          setVisits(prev => {
            // Kiểm tra xem visit đã tồn tại chưa
            const existingIndex = prev.findIndex(v => v.visitId === normalizedData.VisitId);
            if (existingIndex === -1) {
              return [...prev, newVisit].sort((a, b) => a.queueNumber - b.queueNumber);
            }
            return prev;
          });
          
        } else if (normalizedData.Action === 'UPDATE') {
          // Cập nhật visit hiện có
          setVisits(prev => {
            const updatedVisits = prev.map(visit => {
              if (visit.visitId === normalizedData.VisitId) {
                return {
                  ...visit,
                  patientName: normalizedData.PatientName,
                  queueNumber: normalizedData.QueueNumber,
                  status: normalizedData.Status,
                  isPrioritized: normalizedData.IsPrioritized
                };
              }
              return visit;
            });
            
            // Sắp xếp lại theo queue number
            return updatedVisits.sort((a, b) => a.queueNumber - b.queueNumber);
          });
        }
      }
    };

    // Subscribe to visit changes
    signalRService.on('visitChanged', handleVisitChanged);

    // Cleanup
    return () => {
      signalRService.off('visitChanged', handleVisitChanged);
    };
  }, [currentRoomId, currentRoomInfo]); // Depend on currentRoomId và room info để re-subscribe khi đổi phòng

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



  const handleCallPatient = async (visit: VisitResponseDTO) => {
    try {
      
      // Gọi API updateVisitCalling để cập nhật trạng thái
      const response = await appointmentService.updateVisitCalling(visit.visitId);
      
      // Tạo thông báo cho màn hình chờ
      const callNotification = {
        type: 'PATIENT_CALL',
        patientName: visit.patientName,
        queueNumber: visit.queueNumber,
        roomName: currentRoomInfo?.name || 'Phòng khám',
        timestamp: Date.now(),
        visitId: visit.visitId
      };
      
      // Lưu thông báo vào localStorage để màn hình chờ có thể đọc
      localStorage.setItem('waitingRoomNotification', JSON.stringify(callNotification));
      
      // Trigger event để màn hình chờ biết có thông báo mới
      window.dispatchEvent(new CustomEvent('patientCalled', { 
        detail: callNotification 
      }));
      
      // Hiển thị thông báo thành công bằng toast
      toast({
        title: "Thành công!",
        description: `Đã gọi bệnh nhân: ${visit.patientName} đến phòng tổng quát`,
        variant: "success",
      });
      
      // Refresh lại danh sách để cập nhật trạng thái mới
      await fetchNurseScheduleAndVisits(selectedDate);
      
    } catch (error: any) {
      toast({
        title: "Lỗi!",
        description: 'Có lỗi xảy ra khi gọi bệnh nhân: ' + (error?.message || 'Unknown error'),
        variant: "destructive",
      });
    }
  };

  const handleOpenWaitingRoomDisplay = () => {
    // Mở màn hình chờ trong tab mới
    window.open('/waiting-room-display', '_blank');
  };

  return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
              Hàng chờ bệnh nhân phòng tổng quát
            </h1>
            <p className="text-gray-600">
              Quản lý danh sách bệnh nhân chờ khám phòng tổng quát hôm nay
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Date Selector */}
            <div className="clinic-card min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn ngày khám
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              />
            </div>
            
            {/* SignalR Status Debug */}
            <div className="clinic-card min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SignalR Status
              </label>
              <div className="text-sm">
                <div className={`px-2 py-1 rounded ${signalRStatus === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {signalRStatus}
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleOpenWaitingRoomDisplay}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Monitor className="h-4 w-4 mr-2" />
              Màn hình chờ
            </Button>
          </div>
        </div>



        {/* Waiting Queue */}
        <div className="clinic-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy">
              Danh sách bệnh nhân
            </h2>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-clinic-blue/10 text-clinic-blue rounded-full text-sm font-medium">
                {visits.length} bệnh nhân
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinic-blue mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => fetchNurseScheduleAndVisits(selectedDate)}
                className="clinic-button-primary"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* No Schedule Message */}
          {noScheduleMessage && !loading && !error && (
            <div className="text-center py-8">
              <Clock className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">{noScheduleMessage}</p>
            </div>
          )}

          {/* Visits Table */}
          {!loading && !error && !noScheduleMessage && (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 rounded-t-lg border-b">
                  <div className="col-span-2 text-sm font-semibold text-clinic-navy">
                    Số thứ tự
                  </div>
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
                    <div key={visit.visitId} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      {/* Queue Number */}
                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-clinic-blue text-white rounded-full font-semibold text-lg">
                            {visit.queueNumber}
                          </span>
                          {visit.isPrioritized && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              Ưu tiên
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Patient Info */}
                      <div className="col-span-5 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-clinic-blue to-clinic-navy rounded-full flex items-center justify-center">
                          <User className="text-white" size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-clinic-navy text-lg">
                            {visit.patientName || 'N/A'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            ID: {visit.patientProfileId?.slice(0, 8)}...
                          </p>
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
                          visit.status === 'IN_EXAMINATION' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
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
                           visit.status === 'IN_EXAMINATION' ? 'Đang khám' :
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
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            onClick={() => handleCallPatient(visit)}
                          >
                            <PhoneCall size={16} />
                            <span>Gọi bệnh nhân</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {visits.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chưa có bệnh nhân nào
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Hiện tại chưa có bệnh nhân nào đang chờ khám trong ngày được chọn
                  </p>
                </div>
              )}

              {/* Pagination */}
              {visits.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-lg border-t">
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
                          : 'text-clinic-navy bg-white hover:bg-clinic-blue hover:text-white shadow-sm hover:shadow-md'
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
                              ? 'bg-clinic-blue text-white shadow-md'
                              : 'text-clinic-navy bg-white hover:bg-clinic-blue hover:text-white shadow-sm hover:shadow-md'
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
                          : 'text-clinic-navy bg-white hover:bg-clinic-blue hover:text-white shadow-sm hover:shadow-md'
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
  );
};

export default PatientQueue; 