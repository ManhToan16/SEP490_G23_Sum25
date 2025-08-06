
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Save, ArrowLeft, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appointmentService, TimeSlot, Doctor } from '@/shared/services/appointmentService';
import { useToast } from '@/shared/components/ui/use-toast';
import { Button } from '@/shared/components/ui/button';
import DoctorSchedule from '@/shared/components/ui/DoctorSchedule';

const CreateAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // API data states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    gender: '',
    address: '',
    symptoms: '',
    requiredDoctorId: '',
    date: '',
    timeSlotId: ''
  });

  // Doctor selection states
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorSchedule, setShowDoctorSchedule] = useState(false);

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
        return validateRequiredField(value, 'Bác sĩ')
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
      requiredDoctorId: validateRequiredField(formData.requiredDoctorId, 'Bác sĩ')
    };

    setErrors(newErrors);
    
    // Kiểm tra xem có lỗi nào không
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Kiểm tra xem có thể submit form không
  const canSubmitForm = (): boolean => {
    return formData.name.length > 0 && formData.email.length > 0 && formData.phone.length > 0 && 
           formData.birthdate.length > 0 && formData.gender.length > 0 && 
           formData.requiredDoctorId.length > 0 && formData.date.length > 0 && formData.timeSlotId.length > 0;
  };

  // Handle input change with validation
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
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Gọi song song cả 2 API
        const [doctorsData, timeSlotsData] = await Promise.all([
          appointmentService.getDoctors(),
          appointmentService.getTimeSlots()
        ]);
        
        setDoctors(doctorsData);
        setTimeSlots(timeSlotsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Không thể tải dữ liệu cần thiết',
          description: error.message || 'Có lỗi xảy ra khi tải dữ liệu',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        gender: formData.gender,
        address: formData.address,
        symptom: formData.symptoms,
        requiredDoctorId: formData.requiredDoctorId || '',
        date: formData.date,
        timeSlotId: formData.timeSlotId
      };

      // Gọi API tạo lịch hẹn
      const result = await appointmentService.createAppointmentByClinic(appointmentData);
      
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
        requiredDoctorId: '',
        date: '',
        timeSlotId: ''
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
      
      navigate('/receptionist/appointments');
      
    } catch (error: any) {
      console.error('❌ Error creating appointment:', error);
      toast({
        title: 'Có lỗi xảy ra khi đặt lịch khám',
        description: error.message || 'Có lỗi xảy ra khi đặt lịch khám',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/receptionist/appointments')}
          className="flex items-center space-x-2 text-clinic-navy hover:text-clinic-blue"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Đặt lịch khám mới
          </h1>
          <p className="text-gray-600">
            Đặt lịch khám cho bệnh nhân
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="clinic-card">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
              Thông tin lịch khám
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section 1: Patient Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bệnh nhân *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Nhập họ và tên"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue ${
                    errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="example@gmail.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  placeholder="0912345678"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue ${
                    errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh *
                </label>
                <input
                  type="date"
                  name="birthdate"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.birthdate}
                  onChange={(e) => handleInputChange('birthdate', e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue ${
                    errors.birthdate ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue ${
                    errors.gender ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
  
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Địa chỉ hiện tại"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Triệu chứng
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                  placeholder="Mô tả triệu chứng hiện tại..."
                />
              </div>
            </div>

            {/* Section 2: Doctor and Appointment Details */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Chọn Bác Sĩ</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bác sĩ yêu cầu *
                  </label>
                  <select
                    name="requiredDoctorId"
                    value={formData.requiredDoctorId}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    required
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue ${
                      errors.requiredDoctorId ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">{loading ? "Đang tải..." : "Chọn bác sĩ"}</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} {doctor.specialty ? `- ${doctor.specialty}` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.requiredDoctorId && <p className="text-red-500 text-sm mt-1">{errors.requiredDoctorId}</p>}
                </div>

                {/* Doctor's Schedule */}
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
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="flex items-center space-x-2 clinic-button-primary"
              disabled={submitting || !canSubmitForm()}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang đặt lịch khám...</span>
                </>
              ) : (
                <>
                  <Calendar size={20} />
                  <span>Đặt lịch khám</span>
                </>
              )}
            </button>
          </div>

          {/* Thông báo nếu chưa chọn đủ thông tin */}
          {!canSubmitForm() && (
            <div className="text-center mt-4">
              <p className="text-orange-600 text-sm">
                ⚠️ Vui lòng điền đầy đủ thông tin và chọn lịch hẹn trước khi đặt lịch
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateAppointment;
