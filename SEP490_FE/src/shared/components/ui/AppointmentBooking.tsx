import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Calendar } from 'lucide-react';
import { useToast } from '@/shared/components/ui/use-toast';

const AppointmentBooking = () => {
  const [bookingType, setBookingType] = useState('general');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Đặt lịch thành công!",
      description: "Chúng tôi sẽ gửi email xác nhận trong vòng 15 phút.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Đặt Lịch Khám</h2>
        <p className="text-lg text-gray-600">
          Chọn loại khám và điền thông tin để đặt lịch hẹn
        </p>
      </div>

      {/* Booking Type Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card 
          className={`p-6 cursor-pointer transition-all ${bookingType === 'general' ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
          onClick={() => setBookingType('general')}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-2">Đặt Lịch Khám Thường</h3>
          <p className="text-gray-600">Khám tổng quát với bác sĩ có lịch trống</p>
        </Card>
        
        <Card 
          className={`p-6 cursor-pointer transition-all ${bookingType === 'specific' ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
          onClick={() => setBookingType('specific')}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-2">Đặt Lịch Khám Cùng Bác Sĩ</h3>
          <p className="text-gray-600">Chọn bác sĩ cụ thể và thời gian phù hợp</p>
        </Card>
      </div>

      {/* Booking Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Tên bệnh nhân *</Label>
              <Input id="name" placeholder="Nhập họ và tên" required />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="example@gmail.com" required />
            </div>
            
            <div>
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input id="phone" placeholder="0912345678" required />
            </div>
            
            <div>
              <Label htmlFor="birthdate">Ngày sinh *</Label>
              <Input id="birthdate" type="date" required />
            </div>
            
            <div>
              <Label htmlFor="gender">Giới tính *</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Input id="address" placeholder="Địa chỉ hiện tại" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="symptoms">Triệu chứng</Label>
            <Textarea id="symptoms" placeholder="Mô tả triệu chứng hiện tại..." />
          </div>

          {bookingType === 'specific' && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800">Chọn Bác Sĩ</h3>
              
              <div>
                <Label htmlFor="doctor">Bác sĩ yêu cầu *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bác sĩ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor1">BS. Nguyễn Văn An - Nội Thần Kinh</SelectItem>
                    <SelectItem value="doctor2">BS. Trần Thị Bình - Thần Kinh Nhi</SelectItem>
                    <SelectItem value="doctor3">BS. Lê Minh Châu - Điện Não Đồ</SelectItem>
                    <SelectItem value="doctor4">BS. Phạm Hoàng Dũng - Thần Kinh Cơ - Xương - Khớp</SelectItem>
                    <SelectItem value="doctor5">BS. Nguyễn Thị Mai - Tâm Lý Lâm Sàng</SelectItem>
                    <SelectItem value="doctor6">BS. Vũ Quốc Huy - Chẩn Đoán Hình Ảnh</SelectItem>
                    <SelectItem value="doctor7">BS. Lý Thị Hoa - Siêu Âm Doppler</SelectItem>
                    <SelectItem value="doctor8">BS. Đặng Văn Thành - Nội Tổng Hợp</SelectItem>
                    <SelectItem value="doctor9">BS. Hoàng Thị Lan - Xét Nghiệm</SelectItem>
                    <SelectItem value="doctor10">BS. Bùi Minh Tuấn - Thần Kinh Can Thiệp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Ngày khám *</Label>
                  <Input id="date" type="date" required />
                </div>
                
                <div>
                  <Label htmlFor="time">Giờ khám *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">08:00</SelectItem>
                      <SelectItem value="08:30">08:30</SelectItem>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="09:30">09:30</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="10:30">10:30</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="14:30">14:30</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="15:30">15:30</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                      <SelectItem value="16:30">16:30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {bookingType === 'general' && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800">Chọn Thời Gian</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Ngày khám *</Label>
                  <Input id="date" type="date" required />
                </div>
                
                <div>
                  <Label htmlFor="time">Giờ khám *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Buổi sáng (8:00-11:30)</SelectItem>
                      <SelectItem value="afternoon">Buổi chiều (14:00-17:00)</SelectItem>
                      <SelectItem value="evening">Buổi tối (18:00-20:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-center pt-6">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              <Calendar className="w-5 h-5 mr-2" />
              Đặt Lịch Khám
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">Lưu Ý Quan Trọng</h3>
        <ul className="space-y-2 text-yellow-700">
          <li>• Sau khi đặt lịch, chúng tôi sẽ gửi email xác nhận trong vòng 15 phút</li>
          <li>• Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục</li>
          <li>• Mang theo CMND/CCCD và thẻ bảo hiểm y tế (nếu có)</li>
          <li>• Liên hệ hotline 0912345678 nếu cần thay đổi lịch hẹn</li>
        </ul>
      </Card>
    </div>
  );
};

export default AppointmentBooking;
