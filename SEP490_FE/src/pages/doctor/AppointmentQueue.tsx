
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, User, FileText, Eye, Play, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/business/useAuth';
import { appointmentService, VisitResponseDTO } from '../../shared/services/appointmentService';
import { adminService } from '../../shared/services/adminService';
import { signalRService } from '../../shared/services/signalRService';

const AppointmentQueue: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const handleCreateRecord = () => {
    // Navigate to create medical record page
    navigate('/doctor/create-record');
  };

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

  // Function để fetch doctor schedule và visits
  const fetchDoctorScheduleAndVisits = useCallback(async (date: string) => {
    // Lấy userId từ token (field UserId)
    const userId = user?.UserId || user?.id;
    if (!userId) {
      setError('Không tìm thấy thông tin bác sĩ');
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
      // Bước 1: Gọi getByUserSchedule để lấy schedule của bác sĩ để biết bác sĩ làm ở phòng nào
      
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

      // Lấy roomId từ schedule đầu tiên (giả sử bác sĩ chỉ có 1 schedule trong ngày)
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
      fetchDoctorScheduleAndVisits(selectedDate);
    }
  }, [user, selectedDate, fetchDoctorScheduleAndVisits]);

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

      
      // Xử lý visit nếu thuộc về phòng khám hiện tại của bác sĩ HOẶC nếu chưa có room filter
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

  // Function để update visit status
  const updateVisitStatus = async (visitId: string, newStatus: string) => {
    // TODO: Implement API call để update visit status
    
    // Tạm thời update local state
    setVisits(prev =>
      prev.map(visit =>
        visit.visitId === visitId ? { ...visit, status: newStatus } : visit
      )
    );
  };

  // Function để xử lý khi ấn button "Chi tiết"
  const handleViewDetails = async (visit: VisitResponseDTO) => {
    try {
      
      // Gọi 2 API song song
      const [visitResponse, examinationResponse] = await Promise.allSettled([
        appointmentService.getVisitByVisitId(visit.visitId),
        appointmentService.getExaminationResultByVisitId(visit.visitId)
      ]);

      
      // Xử lý kết quả visit
      let visitData = null;
      if (visitResponse.status === 'fulfilled' && visitResponse.value?.data) {
        visitData = visitResponse.value.data[0]; // API trả về array
      } else {
        visitData = visit;
      }

      // Xử lý kết quả examination
      let examinationData = null;
      if (examinationResponse.status === 'fulfilled' && examinationResponse.value?.data) {
        const examData = examinationResponse.value.data[0]; // API trả về array
        if (examData && Object.keys(examData).length > 0) {
          examinationData = examData;
        } else {
          // Handle error silently
        }
      } else {
        // Handle error silently
      }

      // Nếu chưa có examination result, tạo mới
      if (!examinationData) {
        try {
          
          // Tạo examination result mới với dữ liệu mặc định
          const defaultExaminationData = {
            summary: '',
            conclusion: ''
          };

          const createResponse = await appointmentService.createExaminationResult(visit.visitId, defaultExaminationData);
          
          if (createResponse?.data) {
            examinationData = createResponse.data[0]; // API trả về array
          } else {
            // Handle error silently
          }
        } catch (createError: any) {
          // Handle error silently
          // Tiếp tục navigate ngay cả khi tạo examination result thất bại
        }
      }

      // Navigate đến trang examination form với dữ liệu đã chuẩn bị
      
      navigate('/doctor/create-examination', { 
        state: { 
          visit: visitData,
          examination: examinationData,
          isEdit: !!examinationData // true nếu đã có examination result, false nếu tạo mới
        } 
      });

    } catch (error: any) {
      // Fallback: navigate với dữ liệu visit hiện tại
      navigate('/doctor/create-examination', { 
        state: { visit } 
      });
    }
  };

  // Chuyển đổi visits thành format tương thích với UI hiện tại
  const convertVisitsToAppointments = (visits: VisitResponseDTO[]) => {
    return visits.map(visit => ({
      id: visit.visitId,
      time: 'N/A', // TODO: Cần lấy từ timeSlot nếu có
      patient: {
        name: visit.patientName || 'N/A',
        age: 0, // TODO: Cần tính từ dateOfBirth nếu có
        gender: 'N/A', // TODO: Cần lấy từ patient profile
        phone: 'N/A' // TODO: Cần lấy từ patient profile
      },
      reason: 'Khám tổng quát', // TODO: Cần lấy từ appointment nếu có
      status: visit.status || 'Đang chờ',
      priority: visit.isPrioritized ? 'Cao' : 'Bình thường',
      lastVisit: null, // TODO: Có thể lấy từ medical history nếu cần
      type: 'Khám bệnh',
      queueNumber: visit.queueNumber
    }));
  };

  // Sử dụng dữ liệu từ API thay vì mock data
  const appointments = convertVisitsToAppointments(visits);

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

  const statusOptions = [
    { label: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Chờ check-in', color: 'bg-blue-100 text-blue-800' },
    { label: 'Chờ xác nhận', color: 'bg-orange-100 text-orange-800' },
    { label: 'Đã check-in', color: 'bg-green-100 text-green-800' },
    { label: 'Đang chờ thanh toán', color: 'bg-orange-100 text-orange-800' },
    { label: 'Đang khám', color: 'bg-purple-100 text-purple-800' },
    { label: 'Đang xét nghiệm', color: 'bg-indigo-100 text-indigo-800' },
    { label: 'Đang trở lại phòng', color: 'bg-cyan-100 text-cyan-800' },
    { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
  ];

  // Không cần appointmentList state nữa vì đã dùng visits state
  const updateAppointmentStatus = (id: string, newStatus: string) => {
    updateVisitStatus(id, newStatus);
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.label === status);
    return option ? option.color : 'bg-gray-100 text-gray-800';
  };

const waitingStatuses = ['Đang chờ', 'Chờ check-in', 'Chờ xác nhận', 'Đã check-in', 'Đang chờ thanh toán', 'Đang khám', 'Đang xét nghiệm', 'Đang trở lại phòng', 'Đã hủy'];
const waitingAppointments = appointments.filter(apt => waitingStatuses.includes(apt.status));
const completedAppointments = appointments.filter(apt => apt.status === 'Hoàn thành');

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Hàng chờ khám bệnh
          </h1>
          <p className="text-gray-600">
            Quản lý danh sách bệnh nhân chờ khám hôm nay
          </p>
        </div>
        
        {/* Date Selector - moved to header */}
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
              onClick={() => fetchDoctorScheduleAndVisits(selectedDate)}
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
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center">
                      <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                        visit.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        visit.status === 'WAITING_FOR_CHECK_IN' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        visit.status === 'WAITING_FOR_CONFIRMATION' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        visit.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800 border border-green-200' :
                        visit.status === 'PENDING' || visit.status === 'PENDING_WITHOUT_ASSIGNMENT' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        visit.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        visit.status === 'IN_EXAMINATION' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        visit.status === 'IN_EXAMINATION_PROGRESS' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        visit.status === 'IN_LABORATORY' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        visit.status === 'IN_LABORATORY_PROGRESS' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                        visit.status === 'RETURNING' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
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
                         visit.status === 'PENDING' || visit.status === 'PENDING_WITHOUT_ASSIGNMENT' ? 'Đang chờ thanh toán' :
                         visit.status === 'IN_PROGRESS' ? 'Đang khám' :
                         visit.status === 'IN_EXAMINATION' ? 'Đang khám' :
                         visit.status === 'IN_EXAMINATION_PROGRESS' ? 'Đang khám' :
                         visit.status === 'IN_LABORATORY' ? 'Đang xét nghiệm' :
                         visit.status === 'IN_LABORATORY_PROGRESS' ? 'Đang xét nghiệm' :
                         visit.status === 'RETURNING' ? 'Đang trở lại phòng' :
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
                      <button 
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        onClick={() => handleViewDetails(visit)}
                      >
                        <Eye size={16} />
                        <span>Chi tiết</span>
                      </button>
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

export default AppointmentQueue;
