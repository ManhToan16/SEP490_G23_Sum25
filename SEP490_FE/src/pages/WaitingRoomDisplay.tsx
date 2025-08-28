import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Clock, User, Stethoscope, Package, Bell, ChevronDown } from 'lucide-react';
import { appointmentService, VisitResponseDTO } from '@/shared/services/appointmentService';
import { adminService } from '@/shared/services/adminService';
import { signalRService } from '@/shared/services/signalRService';

interface Patient {
  id: number;
  queueNumber: number;
  patientName: string;
  room: string;
  doctor: string;
  status: 'waiting' | 'called' | 'in-examination' | 'completed';
  time: string;
}

interface ExaminationRoom {
  id: string;
  name: string;
  description: string;
}



const WaitingRoomDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [queue, setQueue] = useState<Patient[]>([]);
  const [currentCall, setCurrentCall] = useState<Patient | null>(null);
  
  // State cho dropdown và visits
  const [examinationRooms, setExaminationRooms] = useState<ExaminationRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ExaminationRoom | null>(null);
  const [visits, setVisits] = useState<VisitResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // State cho thông báo gọi bệnh nhân
  const [callNotification, setCallNotification] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Fetch examination rooms khi component mount
  useEffect(() => {
    fetchExaminationRooms();
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
      
      // Xử lý visit nếu thuộc về phòng khám đã chọn HOẶC nếu chưa chọn phòng
      const shouldProcess = !selectedRoom || normalizedData.ExaminationRoomId === selectedRoom.id;
      
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
            examinationRoomName: selectedRoom?.name || '',
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
  }, [selectedRoom]); // Depend on selectedRoom để re-subscribe khi đổi phòng

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch visits theo phòng khám đã chọn
  const fetchVisitsByRoom = useCallback(async (roomId: string) => {
    if (!roomId) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Bước 1: Lấy danh sách visits
      const response = await appointmentService.getVisitsByRoomAndDate({
        examinationRoomId: roomId,
        date: today,
        pageNumber: 1,
        pageSize: 100
      });

      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        const visitsData = response.data[0]?.items || [];
        
        // Bước 2: Lấy thông tin bác sĩ từ schedule cho từng visit
        const visitsWithDoctorInfo = await Promise.all(
          visitsData.map(async (visit) => {
            try {
              // Nếu đã có assignedDoctorName thì không cần fetch thêm
              if (visit.assignedDoctorName && visit.assignedDoctorName !== 'N/A') {
                return visit;
              }
              
              // Fetch schedule của bác sĩ để lấy userName
              if (visit.assignedDoctorId) {
                const scheduleResponse = await appointmentService.getByUserSchedule(visit.assignedDoctorId, {
                  fromDate: today,
                  toDate: today
                });
                
                if (scheduleResponse?.data && scheduleResponse.data.length > 0) {
                  const doctorSchedule = scheduleResponse.data[0];
                  return {
                    ...visit,
                    assignedDoctorName: doctorSchedule.userName || visit.assignedDoctorName || 'N/A'
                  };
                }
              }
              
              return visit;
            } catch (error) {
              return visit;
            }
          })
        );
        
        setVisits(visitsWithDoctorInfo);
      } else {
        setVisits([]);
      }
    } catch (error) {
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Xử lý thông báo gọi bệnh nhân
  const handlePatientCall = useCallback((notification: any) => {
    setCallNotification(notification);
    setShowNotification(true);

    // Tự động ẩn thông báo sau 10 giây
    setTimeout(() => {
      setShowNotification(false);
      setCallNotification(null);
      // Xóa notification khỏi localStorage
      localStorage.removeItem('waitingRoomNotification');
      
      // Tự động load lại danh sách chờ khám để cập nhật trạng thái
      if (selectedRoom) {
        fetchVisitsByRoom(selectedRoom.id);
      }
    }, 10000);
  }, [selectedRoom, fetchVisitsByRoom]);

  // Lắng nghe thông báo gọi bệnh nhân
  useEffect(() => {
    // Lắng nghe event từ localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'waitingRoomNotification' && e.newValue) {
        try {
          const notification = JSON.parse(e.newValue);
          handlePatientCall(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      }
    };

    // Lắng nghe custom event
    const handlePatientCalledEvent = (e: CustomEvent) => {
      handlePatientCall(e.detail);
    };

    // Kiểm tra notification có sẵn trong localStorage khi component mount
    const checkExistingNotification = () => {
      const existingNotification = localStorage.getItem('waitingRoomNotification');
      if (existingNotification) {
        try {
          const notification = JSON.parse(existingNotification);
          // Chỉ hiển thị nếu notification còn mới (trong vòng 30 giây)
          if (Date.now() - notification.timestamp < 30000) {
            handlePatientCall(notification);
          }
        } catch (error) {
          console.error('Error parsing existing notification:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('patientCalled', handlePatientCalledEvent as EventListener);
    checkExistingNotification();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('patientCalled', handlePatientCalledEvent as EventListener);
    };
  }, [handlePatientCall]);

  // Fetch danh sách phòng khám
  const fetchExaminationRooms = async () => {
    try {
      const rooms = await adminService.getExaminationRooms();
      setExaminationRooms(rooms);
    } catch (error) {
      // Handle error silently
    }
  };

  // Xử lý khi chọn phòng khám
  const handleRoomSelect = (room: ExaminationRoom) => {
    setSelectedRoom(room);
    setIsDropdownOpen(false);
    fetchVisitsByRoom(room.id);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-yellow-100 text-yellow-800";
      case "called": return "bg-red-100 text-red-800";
      case "in-examination": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting": return "Đang chờ";
      case "called": return "Đã gọi";
      case "in-examination": return "Đang khám";
      case "completed": return "Hoàn thành";
      default: return status;
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "WAITING": 
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "IN_EXAMINATION":
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "PENDING":
      case "PENDING_WITHOUT_ASSIGNMENT":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "IN_LABORATORY":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "RETURNING":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border border-red-200";
      // Backward compatibility cho các trạng thái cũ
      case "CALLED":
      case "ĐÃ GỌI":
        return "bg-red-100 text-red-800 border border-red-200";
      default: 
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getVisitStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case "WAITING": return "Đang chờ";
      case "IN_EXAMINATION": return "Đang khám";
      case "IN_PROGRESS": return "Đang khám";
      case "PENDING": return "Đang chờ thanh toán";
      case "PENDING_WITHOUT_ASSIGNMENT": return "Đang chờ thanh toán";
      case "IN_LABORATORY": return "Đang xét nghiệm";
      case "RETURNING": return "Đang quay lại phòng";
      case "COMPLETED": return "Hoàn thành";
      case "CANCELLED": return "Đã hủy";
      // Backward compatibility cho các trạng thái cũ
      case "CALLED": return "Đã gọi";
      default: return status || "Đang chờ";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 relative">
      {/* Thông báo gọi bệnh nhân - Overlay toàn màn hình */}
      {showNotification && callNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-500">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-4 text-center transform animate-in zoom-in duration-500">
            {/* Icon chuông */}
            <div className="mb-6">
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Bell className="w-12 h-12 text-white" />
              </div>
            </div>
            
            {/* Tiêu đề */}
            <h2 className="text-4xl font-bold text-red-600 mb-4 animate-bounce">
              THÔNG BÁO
            </h2>
            
            {/* Thông tin bệnh nhân */}
            <div className="mb-6">
              <p className="text-2xl font-semibold text-gray-800 mb-2">
                Mời bệnh nhân
              </p>
              <p className="text-5xl font-bold text-blue-800 mb-4">
                {callNotification.patientName}
              </p>
              <p className="text-3xl font-semibold text-gray-700 mb-2">
                Số thứ tự: <span className="text-red-600 font-bold">{callNotification.queueNumber}</span>
              </p>
              <p className="text-2xl text-gray-600">
                Vào {callNotification.roomName}
              </p>
            </div>
            
            {/* Hướng dẫn */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <p className="text-xl font-medium text-yellow-800">
                Vui lòng đến phòng khám ngay
              </p>
            </div>
            
            {/* Countdown timer */}
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Thông báo này sẽ tự động đóng sau 10 giây
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">
          PHÒNG KHÁM NỘI THẦN KINH KHÁNH AN
        </h1>
        <div className="flex justify-center items-center gap-8 text-xl">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">{formatTime(currentTime)}</span>
          </div>
          <div className="text-gray-600">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>

      {/* Room Selection Dropdown */}
      <div className="mb-8 flex justify-center">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[300px]"
          >
            <Package className="w-5 h-5 text-gray-600" />
            <span className="flex-1 text-left">
              {selectedRoom ? selectedRoom.name : 'Chọn phòng khám'}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {examinationRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{room.name}</div>
                  {room.description && (
                    <div className="text-sm text-gray-500">{room.description}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>



      {/* Visits Display */}
      {selectedRoom && (
        <div className="max-w-6xl mx-auto">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-800">
                DANH SÁCH CHỜ KHÁM - {selectedRoom.name}
              </h2>
              {loading && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
            </div>
            
            {visits.length === 0 && !loading ? (
              <div className="text-center py-8 text-gray-500">
                Không có bệnh nhân nào trong hàng chờ
              </div>
            ) : (
              <div className="space-y-4">
                {visits.map((visit) => (
                  <div
                    key={visit.visitId}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Queue Number */}
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-semibold text-lg">
                          {visit.queueNumber}
                        </span>
                        {visit.isPrioritized && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Ưu tiên
                          </span>
                        )}
                      </div>
                      
                      {/* Patient Info */}
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                          <User className="text-white" size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-gray-900">
                            {visit.patientName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">
                            BS: {visit.assignedDoctorName || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center">
                      <Badge className={getVisitStatusColor(visit.status)}>
                        {getVisitStatusText(visit.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {!selectedRoom && (
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chọn phòng khám để xem danh sách chờ
            </h3>
            <p className="text-gray-500">
              Vui lòng chọn một phòng khám từ dropdown ở trên
            </p>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-gray-600">
        <p className="text-lg">
          Vui lòng chú ý theo dõi màn hình để biết khi nào đến lượt khám
        </p>
        <p className="text-sm mt-2">
          Nếu có thắc mắc, vui lòng liên hệ quầy lễ tân
        </p>
      </div>
    </div>
  );
};

export default WaitingRoomDisplay;