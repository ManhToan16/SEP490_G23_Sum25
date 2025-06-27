
import React, { useState } from 'react';
import { Star, Filter, Calendar, User, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

const DoctorFeedbackList: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data cho đánh giá
  const feedbackData = [
    {
      id: 1,
      doctor: "BS. Nguyễn Văn A",
      patient: "Nguyễn Thị B.",
      stars: 5,
      comment: "Bác sĩ nhẹ nhàng, tư vấn rõ ràng! Rất hài lòng với dịch vụ",
      date: "2025-06-17",
      appointmentType: "Khám tổng quát"
    },
    {
      id: 2,
      doctor: "BS. Trần Thị B",
      patient: "Ẩn danh",
      stars: 4,
      comment: "Bác sĩ chuyên nghiệp, giải thích kỹ càng. Thời gian chờ hơi lâu.",
      date: "2025-06-16",
      appointmentType: "Khám chuyên khoa"
    },
    {
      id: 3,
      doctor: "BS. Nguyễn Văn A",
      patient: "Trần Văn C.",
      stars: 5,
      comment: "Điều trị hiệu quả, thái độ tốt. Rất recomment!",
      date: "2025-06-15",
      appointmentType: "Tái khám"
    },
    {
      id: 4,
      doctor: "BS. Lê Văn C",
      patient: "Ẩn danh",
      stars: 3,
      comment: "Còn hơi nhanh, chưa giải thích kỹ. Cần cải thiện thời gian tư vấn.",
      date: "2025-06-15",
      appointmentType: "Khám tổng quát"
    },
    {
      id: 5,
      doctor: "BS. Trần Thị B",
      patient: "Phạm Thị D.",
      stars: 5,
      comment: "Xuất sắc! Bác sĩ rất tận tâm và chuyên nghiệp.",
      date: "2025-06-14",
      appointmentType: "Khám chuyên khoa"
    },
    {
      id: 6,
      doctor: "BS. Lê Văn C",
      patient: "Ẩn danh",
      stars: 4,
      comment: "Khám nhanh nhưng chính xác. Hài lòng với kết quả điều trị.",
      date: "2025-06-13",
      appointmentType: "Tái khám"
    },
    {
      id: 7,
      doctor: "BS. Nguyễn Văn A",
      patient: "Hoàng Văn E.",
      stars: 2,
      comment: "Thái độ bình thường, cần cải thiện cách tiếp cận bệnh nhân.",
      date: "2025-06-12",
      appointmentType: "Khám tổng quát"
    }
  ];

  // Lấy danh sách bác sĩ duy nhất
  const doctors = Array.from(new Set(feedbackData.map(item => item.doctor))).sort();

  // Tính toán thống kê theo bác sĩ
  const getDoctorStats = () => {
    const stats = doctors.map(doctor => {
      const doctorFeedbacks = feedbackData.filter(item => item.doctor === doctor);
      const totalReviews = doctorFeedbacks.length;
      const averageRating = doctorFeedbacks.reduce((sum, item) => sum + item.stars, 0) / totalReviews;
      
      return {
        doctor,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        starDistribution: {
          5: doctorFeedbacks.filter(f => f.stars === 5).length,
          4: doctorFeedbacks.filter(f => f.stars === 4).length,
          3: doctorFeedbacks.filter(f => f.stars === 3).length,
          2: doctorFeedbacks.filter(f => f.stars === 2).length,
          1: doctorFeedbacks.filter(f => f.stars === 1).length,
        }
      };
    });
    
    return stats.sort((a, b) => b.averageRating - a.averageRating);
  };

  // Lọc dữ liệu
  const filteredData = feedbackData.filter(item => {
    const matchesDoctor = selectedDoctor === '' || item.doctor === selectedDoctor;
    const matchesRating = selectedRating === '' || item.stars.toString() === selectedRating;
    const matchesDate = selectedDate === '' || item.date.includes(selectedDate);
    const matchesSearch = searchTerm === '' || 
      item.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDoctor && matchesRating && matchesDate && matchesSearch;
  });

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const clearFilters = () => {
    setSelectedDoctor('');
    setSelectedRating('');
    setSelectedDate('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Quản lý đánh giá bác sĩ
        </h1>
        <p className="text-gray-600">
          Theo dõi và phân tích đánh giá của bệnh nhân về chất lượng dịch vụ
        </p>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getDoctorStats().map((stat, index) => (
          <div key={stat.doctor} className="clinic-card text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-clinic-blue rounded-lg mx-auto mb-4">
              <User className="text-white" size={32} />
            </div>
            <h3 className="font-medium text-clinic-navy mb-2">{stat.doctor}</h3>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {renderStars(Math.round(stat.averageRating))}
              <span className="ml-2 text-lg font-semibold text-clinic-navy">
                {stat.averageRating}
              </span>
            </div>
            <p className="text-sm text-gray-600">{stat.totalReviews} đánh giá</p>
          </div>
        ))}
      </div>

      {/* Bộ lọc */}
      <div className="clinic-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy flex items-center">
            <Filter className="mr-2" size={20} />
            Bộ lọc
          </h2>
          <Button onClick={clearFilters} variant="outline" size="sm">
            Xóa bộ lọc
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bác sĩ
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            >
              <option value="">Tất cả bác sĩ</option>
              {doctors.map(doctor => (
                <option key={doctor} value={doctor}>{doctor}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức đánh giá
            </label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            >
              <option value="">Tất cả mức độ</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
              <option value="4">⭐⭐⭐⭐ (4 sao)</option>
              <option value="3">⭐⭐⭐ (3 sao)</option>
              <option value="2">⭐⭐ (2 sao)</option>
              <option value="1">⭐ (1 sao)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tháng
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            >
              <option value="">Tất cả thời gian</option>
              <option value="2025-06">Tháng 6/2025</option>
              <option value="2025-05">Tháng 5/2025</option>
              <option value="2025-04">Tháng 4/2025</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo nhận xét, bệnh nhân..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bảng đánh giá */}
      <div className="clinic-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy">
            Danh sách đánh giá ({filteredData.length})
          </h2>
          <div className="text-sm text-gray-600">
            Tổng cộng: {feedbackData.length} đánh giá
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bác sĩ</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Nhận xét</TableHead>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Loại khám</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell className="font-medium">
                    {feedback.doctor}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {renderStars(feedback.stars)}
                      <span className="ml-2 font-medium">{feedback.stars}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={feedback.comment}>
                      {feedback.comment}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" />
                      <span>{feedback.patient}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{feedback.date}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {feedback.appointmentType}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <Star className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Không tìm thấy đánh giá nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorFeedbackList;
