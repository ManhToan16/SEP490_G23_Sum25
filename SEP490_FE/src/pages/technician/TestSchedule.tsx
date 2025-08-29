import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Calendar, Clock, User, FileText, AlertTriangle, AlertCircle } from 'lucide-react';
import TechnicianLayout from '@/shared/components/layouts/TechnicianLayout';
import { useAuth } from '../../shared/hooks/business/useAuth';
import { appointmentService } from '../../shared/services/appointmentService';
import { adminService } from '../../shared/services/adminService';
import { signalRService } from '../../shared/services/signalRService';

interface TestSchedule {
  id: string;
  patientName: string;
  patientId: string;
  testType: string;
  scheduledTime: string;
  estimatedDuration: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent';
  notes?: string;
}

const TestSchedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management cho API data
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noScheduleMessage, setNoScheduleMessage] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomInfo, setCurrentRoomInfo] = useState<{id: string, name: string, description: string} | null>(null);
  
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

  // Function để fetch technician schedule và assignments
  const fetchTechnicianScheduleAndAssignments = useCallback(async (date: string) => {
    // Lấy userId từ token (field UserId)
    const userId = user?.UserId || user?.id;
    if (!userId) {
      setError('Không tìm thấy thông tin kỹ thuật viên');
      return;
    }

    setLoading(true);
    setError(null);
    setNoScheduleMessage(null);
    setAssignments([]);
    setCurrentRoomId(null);
    setCurrentRoomInfo(null);

    try {
      // Bước 1: Gọi getByUserSchedule để lấy schedule của kỹ thuật viên để biết kỹ thuật viên làm ở phòng xét nghiệm nào
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

      // Lấy laboratoryRoomId từ schedule đầu tiên (giả sử kỹ thuật viên chỉ có 1 schedule trong ngày)
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

  // Refs để store current values và tránh infinite loop
  const assignmentsRef = useRef(assignments);
  const selectedDateRef = useRef(selectedDate);
  const fetchFunctionRef = useRef(fetchTechnicianScheduleAndAssignments);
  
  // Update refs khi values thay đổi
  assignmentsRef.current = assignments;
  selectedDateRef.current = selectedDate;
  fetchFunctionRef.current = fetchTechnicianScheduleAndAssignments;

  // useEffect để gọi API khi component mount hoặc khi selectedDate thay đổi
  useEffect(() => {
    // Lấy userId từ user.UserId (từ token) hoặc user.id
    const userId = user?.UserId || user?.id;
    
    if (userId) {
      fetchTechnicianScheduleAndAssignments(selectedDate);
    }
  }, [user, selectedDate, fetchTechnicianScheduleAndAssignments]);

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
            patientName: normalizedData.PatientName,
            patientId: 'N/A', // Backend không gửi patientId
            testType: 'Xét nghiệm',
            scheduledTime: 'N/A',
            estimatedDuration: 'N/A',
            status: normalizedData.Status,
            priority: 'normal',
            notes: ''
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
          
          
          // Cập nhật assignment trong danh sách - thử cả id và assignmentId
          setAssignments(prev => {
            const updated = prev.map(assignment => {
              const isMatch = assignment.id === normalizedData.AssignmentId || 
                             assignment.assignmentId === normalizedData.AssignmentId;
              
              if (isMatch) {
                
                return { ...assignment, status: normalizedData.Status };
              }
              return assignment;
            });
            
            
            return updated;
          });
          
          // Hiển thị thông báo real-time với thông tin chi tiết hơn
          const statusText = normalizedData.Status === 'IN_LABORATORY_PROGRESS' ? 'Đang xét nghiệm' :
                           normalizedData.Status === 'IN_LABORATORY' ? 'Vào phòng xét nghiệm' :
                           normalizedData.Status === 'IN_PROGRESS' ? 'Đang xét nghiệm' :
                           normalizedData.Status === 'WAITING' ? 'Đang chờ' :
                           normalizedData.Status;
          
          setRealtimeNotification({
            show: true,
            message: `🔔 Y tá đã gọi: ${normalizedData.PatientName} - ${statusText}`,
            type: 'success'
          });
          
          // Tự động ẩn thông báo sau 5 giây
          setTimeout(() => setRealtimeNotification(null), 5000);
          
          // Force refresh để đảm bảo UI được cập nhật
          setTimeout(() => {
            
            if (selectedDateRef.current) {
              fetchFunctionRef.current(selectedDateRef.current);
            }
          }, 1000);
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
    
    // Fallback: Refresh data định kỳ nếu SignalR không hoạt động
    const fallbackRefreshInterval = setInterval(() => {
      if (!signalRService.isConnected()) {
        const currentDate = selectedDateRef.current || new Date().toISOString().split('T')[0];
        fetchFunctionRef.current(currentDate);
      }
    }, 30000);
    
    // Cleanup khi component unmount
    return () => {
      signalRService.off('assignmentChanged', handleAssignmentChanged);
      clearInterval(statusInterval);
      clearInterval(fallbackRefreshInterval);
    };
  }, [currentRoomId]); // Chỉ dependency currentRoomId để tránh infinite loop

  // Convert assignments to tests format for compatibility with existing UI
  const convertAssignmentsToTests = (assignments: any[]) => {
    return assignments.map((assignment: any) => ({
      id: assignment.id || assignment.assignmentId,
      assignmentId: assignment.assignmentId || assignment.id, // Thêm assignmentId để matching
      patientName: assignment.patientName || 'N/A',
      patientId: assignment.patientId || assignment.patientProfileId || 'N/A',
      testType: assignment.serviceName || assignment.testType || 'Xét nghiệm',
      scheduledTime: assignment.scheduledTime || 'N/A',
      estimatedDuration: assignment.estimatedDuration || 'N/A',
      status: assignment.status || 'scheduled',
      priority: assignment.priority || 'normal',
      notes: assignment.notes || ''
    }));
  };

  // Use assignments data instead of mock data
  const tests = convertAssignmentsToTests(assignments);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Đã lên lịch</Badge>;
      case 'in-progress':
        return <Badge variant="default">Đang thực hiện</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    return priority === 'urgent' ? (
      <Badge variant="destructive">Ưu tiên</Badge>
    ) : (
      <Badge variant="outline">Bình thường</Badge>
    );
  };



  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lịch xét nghiệm</h1>
          <p className="text-gray-600 mt-2">Quản lý lịch trình xét nghiệm và theo dõi tiến độ</p>
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

      {/* Bộ lọc và tìm kiếm */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium">Ngày</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="ml-2 px-3 py-1 border rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách xét nghiệm */}
      <div className="clinic-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy">
            Danh sách xét nghiệm
          </h2>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {tests.length} xét nghiệm
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
              onClick={() => fetchTechnicianScheduleAndAssignments(selectedDate)}
              className="clinic-button-primary"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* No Schedule Message */}
        {noScheduleMessage && !loading && !error && (
          <div className="text-center py-8">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">{noScheduleMessage}</p>
          </div>
        )}

        {/* Assignments Table */}
        {!loading && !error && !noScheduleMessage && (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-purple-50 rounded-t-lg border-b">
              <div className="col-span-6 text-sm font-semibold text-clinic-navy">
                Thông tin bệnh nhân
              </div>
              <div className="col-span-3 text-sm font-semibold text-clinic-navy">
                Trạng thái
              </div>
              <div className="col-span-3 text-sm font-semibold text-clinic-navy text-center">
                Thao tác
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {tests.map((test) => (
                <div key={test.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* Patient Info */}
                  <div className="col-span-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center">
                      <User className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-clinic-navy text-lg">
                        {test.patientName}
                      </h4>
                      {test.notes && (
                        <div className="text-xs text-orange-600 mt-1">{test.notes}</div>
                      )}
                      </div>
                    </div>

                  {/* Status */}
                  <div className="col-span-3 flex items-center">
                    <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                      test.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      test.status === 'WAITING_FOR_CHECK_IN' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      test.status === 'WAITING_FOR_CONFIRMATION' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      test.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800 border border-green-200' :
                      test.status === 'PENDING' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      test.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      test.status === 'IN_EXAMINATION_PROGRESS' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      test.status === 'IN_LABORATORY' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      test.status === 'IN_LABORATORY_PROGRESS' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                      test.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-200' :
                      test.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border border-red-200' :
                      test.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      test.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      test.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                      test.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {test.status === 'WAITING' ? 'Đang chờ' :
                       test.status === 'WAITING_FOR_CHECK_IN' ? 'Chờ check-in' :
                       test.status === 'WAITING_FOR_CONFIRMATION' ? 'Chờ xác nhận' :
                       test.status === 'CHECKED_IN' ? 'Đã check-in' :
                       test.status === 'PENDING' ? 'Đang chờ thanh toán' :
                       test.status === 'IN_PROGRESS' ? 'Đang xét nghiệm' :
                       test.status === 'IN_EXAMINATION_PROGRESS' ? 'Đang khám' :
                       test.status === 'IN_LABORATORY' ? 'Đang xét nghiệm' :
                       test.status === 'IN_LABORATORY_PROGRESS' ? 'Đang xét nghiệm' :
                       test.status === 'COMPLETED' ? 'Hoàn thành' :
                       test.status === 'CANCELLED' ? 'Đã hủy' :
                       test.status === 'scheduled' ? 'Đã lên lịch' :
                       test.status === 'in-progress' ? 'Đang thực hiện' :
                       test.status === 'completed' ? 'Hoàn thành' :
                       test.status === 'cancelled' ? 'Đã hủy' :
                       test.status}
                      {test.priority === 'urgent' && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Ưu tiên
                        </span>
                      )}
                    </span>
                    </div>

                  {/* Actions */}
                  <div className="col-span-3 flex items-center justify-center space-x-2">
                    <button 
                      onClick={() => navigate(`/technician/test-detail/${test.id}`)}
                      className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm"
                    >
                        Chi tiết
                    </button>
                      {test.status === 'scheduled' && (
                      <button className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm">
                          Bắt đầu
                      </button>
                      )}
                      {test.status === 'in-progress' && (
                      <button className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm">
                          Hoàn thành
                      </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {tests.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-purple-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chưa có xét nghiệm nào
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Hiện tại chưa có xét nghiệm nào được lên lịch trong ngày được chọn
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSchedule; 