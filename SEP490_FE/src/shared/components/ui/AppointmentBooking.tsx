import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Calendar } from 'lucide-react';
import { useToast } from '@/shared/components/ui/use-toast';
import { appointmentService, TimeSlot, Doctor } from '@/shared/services/appointmentService';
import DoctorSchedule from './DoctorSchedule';

const AppointmentBooking = () => {
  const [bookingType, setBookingType] = useState('general');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDoctorSchedule, setShowDoctorSchedule] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    gender: '',
    address: '',
    symptoms: '',
    date: '',
    timeSlotId: '',
    requiredDoctorId: ''
  });

  // Validation errors state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    gender: '',
    date: '',
    timeSlotId: '',
    requiredDoctorId: ''
  });
  
  const { toast } = useToast();

  // Validation functions
  const validatePhone = (phone: string): string => {
    if (!phone) return 'Số điện thoại là bắt buộc';
    
    // Kiểm tra định dạng số điện thoại Việt Nam
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return 'Số điện thoại phải bắt đầu bằng 03, 05, 07, 08, 09 và có 10 chữ số';
    }
    
    return '';
  };

  const validateName = (name: string): string => {
    if (!name) return 'Họ tên là bắt buộc';
    
    if (name.length < 2 || name.length > 100) {
      return 'Họ tên phải từ 2 đến 100 ký tự';
    }
    
    // Kiểm tra ký tự đặc biệt (cho phép dấu tiếng Việt và khoảng trắng)
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    if (!nameRegex.test(name)) {
      return 'Họ tên không được chứa ký tự đặc biệt';
    }
    
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email) return 'Email là bắt buộc';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email không đúng định dạng';
    }
    
    return '';
  };

  const validateDate = (date: string): string => {
    if (!date) return 'Ngày khám là bắt buộc';
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (selectedDate < today) {
      return 'Ngày khám phải từ ngày hôm nay trở đi';
    }
    
    return '';
  };

  const validateRequiredField = (value: string, fieldName: string): string => {
    if (!value) return `${fieldName} là bắt buộc`;
    return '';
  };

  const validateBirthdate = (birthdate: string): string => {
    if (!birthdate) return 'Ngày sinh là bắt buộc';
    
    // Tạo date object từ string YYYY-MM-DD và set time về 00:00:00
    const selectedDate = new Date(birthdate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    // So sánh ngày tháng năm (bỏ qua giờ phút giây)
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (selectedDateOnly > todayOnly) {
      return 'Ngày sinh không thể là ngày trong tương lai';
    }
    
    // Kiểm tra tuổi hợp lý (từ 0 đến 120 tuổi)
    const age = today.getFullYear() - selectedDate.getFullYear();
    if (age < 0 || age > 120) {
      return 'Ngày sinh không hợp lệ';
    }
    
    return '';
  };

  // Validate single field
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'birthdate':
        return validateBirthdate(value);
      case 'gender':
        return validateRequiredField(value, 'Giới tính');
      case 'date':
        return validateDate(value);
      case 'timeSlotId':
        return validateRequiredField(value, 'Giờ khám');
      case 'requiredDoctorId':
        return bookingType === 'specific' ? validateRequiredField(value, 'Bác sĩ') : '';
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      birthdate: validateBirthdate(formData.birthdate),
      gender: validateRequiredField(formData.gender, 'Giới tính'),
      date: validateDate(formData.date),
      timeSlotId: validateRequiredField(formData.timeSlotId, 'Giờ khám'),
      requiredDoctorId: bookingType === 'specific' ? validateRequiredField(formData.requiredDoctorId, 'Bác sĩ') : ''
    };

    setErrors(newErrors);
    
    // Kiểm tra xem có lỗi nào không
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Kiểm tra xem có thể submit form không
  const canSubmitForm = (): boolean => {
    if (bookingType === 'specific') {
      // Với booking specific doctor, cần có đầy đủ thông tin
      return formData.name.length > 0 && formData.email.length > 0 && formData.phone.length > 0 && 
             formData.birthdate.length > 0 && formData.gender.length > 0 && 
             formData.requiredDoctorId.length > 0 && formData.date.length > 0 && formData.timeSlotId.length > 0;
    } else {
      // Với booking general, cần có đầy đủ thông tin
      return formData.name.length > 0 && formData.email.length > 0 && formData.phone.length > 0 && 
             formData.birthdate.length > 0 && formData.gender.length > 0 && 
             formData.date.length > 0 && formData.timeSlotId.length > 0;
    }
  };

  // Gọi API lấy danh sách time slots và doctors khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Gọi song song cả 2 API
        const [timeSlotsData, doctorsData] = await Promise.all([
          appointmentService.getTimeSlots(),
          appointmentService.getDoctors()
        ]);
        
        setTimeSlots(timeSlotsData);
        setDoctors(doctorsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu cần thiết",
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate field real-time
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Handle schedule selection from DoctorSchedule component
  const handleScheduleSelection = (date: string, timeSlotId: string, timeSlotName: string) => {
    setFormData(prev => ({
      ...prev,
      date: date,
      timeSlotId: timeSlotId
    }));
    
    // Clear date and timeSlot errors
    setErrors(prev => ({
      ...prev,
      date: '',
      timeSlotId: ''
    }));
    
    // Không tự động submit form - để user tự ấn nút "Đặt Lịch Khám"
  };

  // Handle doctor selection
  const handleDoctorChange = (doctorId: string) => {
    handleInputChange('requiredDoctorId', doctorId);
    
    if (doctorId) {
      const doctor = doctors.find(d => d.id === doctorId);
      setSelectedDoctor(doctor || null);
      setShowDoctorSchedule(true);
      
      // Reset schedule selection when changing doctor
      setFormData(prev => ({
        ...prev,
        date: '',
        timeSlotId: ''
      }));
    } else {
      setSelectedDoctor(null);
      setShowDoctorSchedule(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate form trước khi submit
    if (!validateForm()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      // Chuẩn bị data cho API
      const appointmentData = {
        name: formData.name,
        phoneNumber: formData.phone,
        email: formData.email,
        dateOfBirth: formData.birthdate,
        gender: formData.gender === 'male' ? 'Nam' : 'Nữ',
        address: formData.address,
        symptom: formData.symptoms,
        requiredDoctorId: formData.requiredDoctorId || "",
        date: formData.date,
        timeSlotId: formData.timeSlotId
      };

      // Gọi API tạo lịch hẹn
      const result = await appointmentService.createAppointment(appointmentData);

      // Hiển thị toast thành công
      toast({
        title: "Yêu cầu đặt lịch khám thành công",
        description: "Vui lòng check email để kiểm tra thông tin yêu cầu đặt lịch.",
        variant: 'success',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        birthdate: '',
        gender: '',
        address: '',
        symptoms: '',
        date: '',
        timeSlotId: '',
        requiredDoctorId: ''
      });

      // Reset errors
      setErrors({
        name: '',
        email: '',
        phone: '',
        birthdate: '',
        gender: '',
        date: '',
        timeSlotId: '',
        requiredDoctorId: ''
      });

      // Reset doctor schedule
      setSelectedDoctor(null);
      setShowDoctorSchedule(false);

    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      toast({
        title: "Lỗi đặt lịch",
        description: error.message || "Có lỗi xảy ra khi đặt lịch hẹn",
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
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
        <form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          onKeyDown={(e) => {
            // Prevent form submission on Enter key
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Tên bệnh nhân *</Label>
              <Input 
                id="name" 
                placeholder="Nhập họ và tên" 
                required 
                value={formData.name} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@gmail.com" 
                required 
                value={formData.email} 
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input 
                id="phone" 
                placeholder="0912345678" 
                required 
                value={formData.phone} 
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="birthdate">Ngày sinh *</Label>
              <Input 
                id="birthdate" 
                type="date" 
                required 
                max={new Date().toISOString().split('T')[0]}
                value={formData.birthdate} 
                onChange={(e) => handleInputChange('birthdate', e.target.value)}
                className={errors.birthdate ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
            </div>

            <div>
              <Label htmlFor="gender">Giới tính *</Label>
              <Select required value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className={errors.gender ? 'border-red-500 focus:border-red-500' : ''}>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>

            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Input id="address" placeholder="Địa chỉ hiện tại" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="symptoms">Triệu chứng</Label>
            <Textarea id="symptoms" placeholder="Mô tả triệu chứng hiện tại..." value={formData.symptoms} onChange={(e) => handleInputChange('symptoms', e.target.value)} />
          </div>

          {bookingType === 'specific' && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800">Chọn Bác Sĩ</h3>

              <div>
                <Label htmlFor="doctor">Bác sĩ yêu cầu *</Label>
                <Select required disabled={loading} value={formData.requiredDoctorId} onValueChange={handleDoctorChange}>
                  <SelectTrigger className={errors.requiredDoctorId ? 'border-red-500 focus:border-red-500' : ''}>
                    <SelectValue placeholder={loading ? "Đang tải..." : "Chọn bác sĩ"} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors && doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} {doctor.specialty ? `- ${doctor.specialty}` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        {loading ? "Đang tải bác sĩ..." : "Không có bác sĩ nào"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.requiredDoctorId && <p className="text-red-500 text-sm mt-1">{errors.requiredDoctorId}</p>}
              </div>

              {/* Doctor Schedule Component */}
              {showDoctorSchedule && selectedDoctor && (
                <DoctorSchedule
                  doctorId={selectedDoctor.id}
                  doctorName={selectedDoctor.name}
                  onSelectSchedule={handleScheduleSelection}
                />
              )}

              {/* Selected Schedule Display */}
              {formData.date && formData.timeSlotId && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Lịch hẹn đã chọn
                  </h4>
                  <div className="space-y-2 text-green-700">
                    <p className="flex items-center">
                      <span className="font-medium w-20">Bác sĩ:</span>
                      <span className="ml-2">{selectedDoctor?.name}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-20">Ngày khám:</span>
                      <span className="ml-2">{
                        (() => {
                          try {
                            // Kiểm tra nếu date đã là format YYYY-MM-DD
                            if (formData.date.includes('-')) {
                              return new Date(formData.date).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            } else {
                              // Nếu là format DD/MM/YYYY
                              const [day, month, year] = formData.date.split('/');
                              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                              return date.toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            }
                          } catch (error) {
                            console.error('Error formatting date:', formData.date, error);
                            return 'Ngày không hợp lệ';
                          }
                        })()
                      }</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-20">Giờ khám:</span>
                      <span className="ml-2">{timeSlots.find(slot => slot.id === formData.timeSlotId)?.name || 'N/A'} | {timeSlots.find(slot => slot.id === formData.timeSlotId)?.startTime?.slice(0, 5) || 'N/A'}-{timeSlots.find(slot => slot.id === formData.timeSlotId)?.endTime?.slice(0, 5) || 'N/A'}</span>
                    </p>
                  </div>
                  
                  {/* Hướng dẫn cho user */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      <strong>💡 Hướng dẫn:</strong> Bạn có thể thay đổi lịch bằng cách chọn ca khác, hoặc ấn nút "Đặt Lịch Khám" bên dưới để hoàn tất đặt lịch.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {bookingType === 'general' && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800">Chọn Thời Gian</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Ngày khám *</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    required 
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date} 
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={errors.date ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                </div>

                <div>
                  <Label htmlFor="time">Giờ khám *</Label>
                  <Select required disabled={loading} value={formData.timeSlotId} onValueChange={(value) => handleInputChange('timeSlotId', value)}>
                    <SelectTrigger className={errors.timeSlotId ? 'border-red-500 focus:border-red-500' : ''}>
                      <SelectValue placeholder={loading ? "Đang tải..." : "Chọn giờ"} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.name} ({slot.startTime.slice(0, 5)}-{slot.endTime.slice(0, 5)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.timeSlotId && <p className="text-red-500 text-sm mt-1">{errors.timeSlotId}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center pt-6">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={submitting || !canSubmitForm()}
            >
              <Calendar className="w-5 h-5 mr-2" />
              {submitting ? "Đang đặt lịch..." : "Đặt Lịch Khám"}
            </Button>
          </div>
          
          {/* Thông báo nếu chưa chọn đủ thông tin */}
          {!canSubmitForm() && bookingType === 'specific' && (
            <div className="text-center mt-4">
              <p className="text-orange-600 text-sm">
                ⚠️ Vui lòng điền đầy đủ thông tin và chọn lịch hẹn trước khi đặt lịch
              </p>
            </div>
          )}
        </form>
      </Card>

      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">Lưu Ý Quan Trọng</h3>
        <ul className="space-y-2 text-yellow-700">
          <li>• Sau khi đặt lịch, chúng tôi sẽ gửi email xác nhận thông tin yêu cầu đặt lịch</li>
          <li>• Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục</li>
          <li>• Mang theo CMND/CCCD và thẻ bảo hiểm y tế (nếu có)</li>
          <li>• Liên hệ hotline 0912345678 nếu cần thay đổi lịch hẹn</li>
        </ul>
      </Card>
    </div>
  );
};

export default AppointmentBooking;
