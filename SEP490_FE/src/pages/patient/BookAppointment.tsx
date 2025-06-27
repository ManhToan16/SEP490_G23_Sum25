import React, { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  ChevronRight,
} from "lucide-react";

const BookAppointment: React.FC = () => {
  const [bookingType, setBookingType] = useState<"normal" | "doctor">("normal");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const doctors = [
    {
      id: 1,
      name: "BS. Nguyễn Văn A",
      specialty: "Thần kinh học",
      experience: "15 năm kinh nghiệm",
      rating: 4.8,
      availableDays: ["Thứ 2", "Thứ 4", "Thứ 6"],
      timeSlots: ["09:00", "10:00", "14:00", "15:00"],
    },
    {
      id: 2,
      name: "BS. Trần Thị B",
      specialty: "Tâm thần học",
      experience: "12 năm kinh nghiệm",
      rating: 4.9,
      availableDays: ["Thứ 3", "Thứ 5", "Thứ 7"],
      timeSlots: ["08:30", "09:30", "13:30", "14:30"],
    },
    {
      id: 3,
      name: "BS. Lê Văn C",
      specialty: "Thần kinh học",
      experience: "10 năm kinh nghiệm",
      rating: 4.7,
      availableDays: ["Thứ 2", "Thứ 3", "Thứ 5"],
      timeSlots: ["10:30", "11:30", "15:30", "16:30"],
    },
  ];

  // const services = [
  //   { id: 1, name: 'Khám tổng quát thần kinh', fee: '500.000đ', duration: '30 phút' },
  //   { id: 2, name: 'Khám chuyên sâu não bộ', fee: '800.000đ', duration: '60 phút' },
  //   { id: 3, name: 'Tư vấn tâm lý', fee: '400.000đ', duration: '45 phút' },
  //   { id: 4, name: 'Điện não đồ (EEG)', fee: '1.200.000đ', duration: '90 phút' },
  //   { id: 5, name: 'Khám định kỳ', fee: '300.000đ', duration: '20 phút' }
  // ];

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  const handleBooking = () => {
    // Mock booking logic
    alert(
      "Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất."
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Đặt lịch khám bệnh
        </h1>
        <p className="text-gray-600">
          Chọn dịch vụ và thời gian phù hợp để đặt lịch hẹn
        </p>
      </div>

      {/* Booking Type Selection */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Loại đặt lịch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setBookingType("normal")}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              bookingType === "normal"
                ? "border-clinic-navy bg-clinic-blue"
                : "border-gray-300 hover:border-clinic-blue"
            }`}
          >
            <h3 className="font-medium text-clinic-navy mb-2">
              Đặt lịch bình thường
            </h3>
            <p className="text-gray-600 text-sm">
              Chọn dịch vụ và thời gian khám
            </p>
          </button>

          <button
            onClick={() => setBookingType("doctor")}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              bookingType === "doctor"
                ? "border-clinic-navy bg-clinic-blue"
                : "border-gray-300 hover:border-clinic-blue"
            }`}
          >
            <h3 className="font-medium text-clinic-navy mb-2">
              Đặt lịch theo bác sĩ
            </h3>
            <p className="text-gray-600 text-sm">
              Chọn bác sĩ cụ thể và xem lịch trống
            </p>
          </button>
        </div>
      </div>

      {bookingType === "normal" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="clinic-card">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
              Chọn ngày khám
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            />
          </div>

          <div className="clinic-card">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
              Chọn giờ khám
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 text-sm border rounded transition-colors ${
                    selectedTime === time
                      ? "border-clinic-navy bg-clinic-navy text-white"
                      : "border-gray-300 hover:border-clinic-blue"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Doctor-based Booking */
        <div className="space-y-6">
          {/* Doctor Selection */}
          <div className="clinic-card">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
              Chọn bác sĩ
            </h2>
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor.name)}
                  className={`w-full p-4 border rounded-lg text-left transition-colors ${
                    selectedDoctor === doctor.name
                      ? "border-clinic-navy bg-clinic-blue"
                      : "border-gray-300 hover:border-clinic-blue"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-clinic-navy rounded-lg flex items-center justify-center">
                        <User className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium text-clinic-navy">
                          {doctor.name}
                        </h3>
                        <p className="text-gray-600">{doctor.specialty}</p>
                        <p className="text-sm text-gray-500">
                          {doctor.experience}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-orange-600">
                            ⭐ {doctor.rating}
                          </span>
                          <span className="text-sm text-gray-500">
                            Làm việc: {doctor.availableDays.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Doctor's Schedule */}
          {selectedDoctor && (
            <div className="clinic-card">
              <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
                Lịch làm việc của {selectedDoctor}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-clinic-navy mb-3">
                    Chọn ngày
                  </h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                  />
                </div>

                <div>
                  <h3 className="font-medium text-clinic-navy mb-3">
                    Khung giờ trống
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {doctors
                      .find((d) => d.name === selectedDoctor)
                      ?.timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 text-sm border rounded transition-colors ${
                            selectedTime === time
                              ? "border-clinic-navy bg-clinic-navy text-white"
                              : "border-gray-300 hover:border-clinic-blue"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Summary and Confirmation */}
      {((bookingType === "normal" && selectedDate && selectedTime) ||
        (bookingType === "doctor" &&
          selectedDoctor &&
          selectedDate &&
          selectedTime)) && (
        <div className="clinic-card">
          <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
            Xác nhận thông tin đặt lịch
          </h2>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-6">
            {bookingType === "normal" && (
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-clinic-navy" />
                <span>Dịch vụ: {selectedService}</span>
              </div>
            )}

            {bookingType === "doctor" && (
              <div className="flex items-center space-x-2">
                <User size={16} className="text-clinic-navy" />
                <span>Bác sĩ: {selectedDoctor}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-clinic-navy" />
              <span>Ngày: {selectedDate}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-clinic-navy" />
              <span>Giờ: {selectedTime}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú (không bắt buộc)
              </label>
              <textarea
                rows={3}
                placeholder="Nhập ghi chú hoặc triệu chứng..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              />
            </div>

            <button
              onClick={handleBooking}
              className="w-full clinic-button-primary py-3 text-lg flex items-center justify-center space-x-2"
            >
              <span>Xác nhận đặt lịch</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
