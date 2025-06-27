
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Star } from 'lucide-react';

const DoctorReviewList: React.FC = () => {
  const navigate = useNavigate();

  // Mock data cho các lịch hẹn đã hoàn thành chưa được đánh giá
  const completedAppointments = [
    {
      id: 1,
      date: '2025-06-17',
      time: '09:00',
      doctor: 'BS. Nguyễn Văn A',
      specialty: 'Thần kinh học',
      room: 'Phòng khám chính 1',
      fee: '500.000đ',
      type: 'Khám tổng quát',
      status: 'Đã khám',
      isReviewed: false
    },
    {
      id: 2,
      date: '2025-06-15',
      time: '14:30',
      doctor: 'BS. Trần Thị B',
      specialty: 'Tâm thần học',
      room: 'Phòng khám chính 2',
      fee: '600.000đ',
      type: 'Khám chuyên khoa',
      status: 'Đã khám',
      isReviewed: false
    },
    {
      id: 3,
      date: '2025-06-12',
      time: '10:30',
      doctor: 'BS. Lê Văn C',
      specialty: 'Thần kinh học',
      room: 'Phòng khám chính 1',
      fee: '500.000đ',
      type: 'Tái khám',
      status: 'Đã khám',
      isReviewed: true // Đã đánh giá
    }
  ];

  const pendingReviews = completedAppointments.filter(apt => apt.status === 'Đã khám' && !apt.isReviewed);
  const reviewedAppointments = completedAppointments.filter(apt => apt.isReviewed);

  const handleReview = (appointmentId: number) => {
    navigate(`/patient/submit-review/${appointmentId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Đánh giá bác sĩ
        </h1>
        <p className="text-gray-600">
          Chia sẻ trải nghiệm của bạn để giúp cải thiện chất lượng dịch vụ
        </p>
      </div>

      {/* Các lịch hẹn cần đánh giá */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Cần đánh giá ({pendingReviews.length})
        </h2>
        
        {pendingReviews.length > 0 ? (
          <div className="space-y-4">
            {pendingReviews.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-clinic-green rounded-lg">
                        <User className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium text-clinic-navy text-lg">
                          {appointment.doctor}
                        </h3>
                        <p className="text-gray-600">{appointment.specialty} - {appointment.type}</p>
                      </div>
                    </div>
                    
                    <div className="ml-16 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <Calendar size={16} />
                          <span>{appointment.date} - {appointment.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700">
                          <Clock size={16} />
                          <span>{appointment.room}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-gray-700">
                          <span className="font-medium">Chi phí:</span> {appointment.fee}
                        </div>
                        <div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleReview(appointment.id)}
                      className="px-6 py-2 bg-clinic-navy text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
                    >
                      <Star size={16} />
                      <span>Đánh giá</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Không có lịch hẹn nào cần đánh giá</p>
          </div>
        )}
      </div>

      {/* Các lịch hẹn đã đánh giá */}
      {reviewedAppointments.length > 0 && (
        <div className="clinic-card">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
            Đã đánh giá ({reviewedAppointments.length})
          </h2>
          
          <div className="space-y-4">
            {reviewedAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-400 rounded-lg">
                        <User className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-clinic-navy">
                          {appointment.doctor}
                        </h3>
                        <p className="text-gray-600">{appointment.specialty} - {appointment.type}</p>
                      </div>
                    </div>
                    
                    <div className="ml-14 flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar size={14} />
                        <span className="text-sm">{appointment.date} - {appointment.time}</span>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Đã đánh giá
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thông tin hỗ trợ */}
      <div className="clinic-card bg-clinic-blue">
        <div className="flex items-center space-x-4 text-clinic-navy">
          <Star size={24} />
          <div>
            <h3 className="font-medium">Tại sao nên đánh giá?</h3>
            <p className="text-sm">Góp ý của bạn giúp chúng tôi cải thiện chất lượng dịch vụ chăm sóc sức khỏe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorReviewList;
