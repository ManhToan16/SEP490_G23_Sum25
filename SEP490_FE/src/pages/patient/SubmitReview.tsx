
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, User, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';

const SubmitReview: React.FC = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock data cho thông tin lịch hẹn
  const appointmentData = {
    id: appointmentId,
    date: '2025-06-17',
    time: '09:00',
    doctor: 'BS. Nguyễn Văn A',
    specialty: 'Thần kinh học',
    room: 'Phòng khám chính 1',
    fee: '500.000đ',
    type: 'Khám tổng quát',
    doctorInfo: {
      experience: '15 năm kinh nghiệm',
      specialties: ['Đau đầu', 'Rối loạn giấc ngủ', 'Stress và lo âu']
    }
  };

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }
    
    // Giả lập gửi đánh giá
    console.log('Gửi đánh giá:', {
      appointmentId,
      rating,
      comment,
      doctor: appointmentData.doctor,
      date: new Date().toISOString()
    });
    
    setIsSubmitted(true);
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={index}
          type="button"
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          className="focus:outline-none transition-colors"
        >
          <Star
            size={32}
            className={`${
              starValue <= (hoverRating || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } hover:text-yellow-400 hover:fill-yellow-400 transition-colors`}
          />
        </button>
      );
    });
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="clinic-card text-center py-12">
          <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
            <Star className="text-green-600" size={40} />
          </div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-4">
            Cảm ơn bạn đã đánh giá bác sĩ!
          </h1>
          <p className="text-gray-600 mb-8">
            Góp ý của bạn giúp chúng tôi cải thiện chất lượng dịch vụ chăm sóc sức khỏe
          </p>
          <div className="space-x-4">
            <Button
              onClick={() => navigate('/patient/review-list')}
              className="clinic-button-primary"
            >
              Quay lại danh sách
            </Button>
            <Button
              onClick={() => navigate('/patient/dashboard')}
              variant="outline"
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/patient/review-list')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="text-clinic-navy" size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Đánh giá bác sĩ
          </h1>
          <p className="text-gray-600">
            Chia sẻ trải nghiệm của bạn về lần khám bệnh này
          </p>
        </div>
      </div>

      {/* Thông tin lịch hẹn */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Thông tin lịch khám
        </h2>
        
        <div className="flex items-start space-x-4">
          <div className="flex items-center justify-center w-16 h-16 bg-clinic-blue rounded-lg">
            <User className="text-white" size={32} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium text-clinic-navy mb-2">
              {appointmentData.doctor}
            </h3>
            <p className="text-gray-600 mb-2">{appointmentData.specialty}</p>
            <p className="text-sm text-gray-500 mb-3">{appointmentData.doctorInfo.experience}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Calendar size={16} />
                  <span>{appointmentData.date} - {appointmentData.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Clock size={16} />
                  <span>{appointmentData.room}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-gray-700">
                  <span className="font-medium">Loại khám:</span> {appointmentData.type}
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">Chi phí:</span> {appointmentData.fee}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form đánh giá */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-6">
          Đánh giá của bạn
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Đánh giá sao */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mức độ hài lòng tổng thể *
            </label>
            <div className="flex items-center space-x-2 mb-2">
              {renderStars()}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 1 && "Rất không hài lòng"}
                {rating === 2 && "Không hài lòng"}
                {rating === 3 && "Bình thường"}
                {rating === 4 && "Hài lòng"}
                {rating === 5 && "Rất hài lòng"}
              </p>
            )}
          </div>

          {/* Nhận xét */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét chi tiết (tùy chọn)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về thái độ phục vụ, kỹ năng chuyên môn, thời gian chờ đợi..."
              rows={4}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nhận xét của bạn sẽ giúp bác sĩ và phòng khám cải thiện chất lượng dịch vụ
            </p>
          </div>

          {/* Nút gửi */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/patient/review-list')}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="clinic-button-primary"
              disabled={rating === 0}
            >
              Gửi đánh giá
            </Button>
          </div>
        </form>
      </div>

      {/* Lưu ý */}
      <div className="clinic-card bg-gray-50">
        <div className="flex items-start space-x-3">
          <Star className="text-clinic-green mt-1 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium text-clinic-navy mb-1">Lưu ý quan trọng</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Đánh giá của bạn sẽ được giữ bí mật và chỉ dùng để cải thiện dịch vụ</li>
              <li>• Vui lòng đánh giá một cách khách quan và trung thực</li>
              <li>• Đánh giá không thể chỉnh sửa sau khi gửi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitReview;
