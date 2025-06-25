import React, { useState } from 'react';
import './AppointmentBooking.scss';

const AppointmentBooking = () => {
  const [bookingType, setBookingType] = useState('general');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Đặt lịch thành công! Chúng tôi sẽ gửi email xác nhận trong vòng 15 phút.');
  };

  return (
    <div className="appointment-booking">
      <div className="heading">
        <h2>Đặt Lịch Khám</h2>
        <p>Chọn loại khám và điền thông tin để đặt lịch hẹn</p>
      </div>

      <div className="booking-type">
        <div
          className={`option ${bookingType === 'general' ? 'active' : ''}`}
          onClick={() => setBookingType('general')}
        >
          <h3>Đặt Lịch Khám Thường</h3>
          <p>Khám tổng quát với bác sĩ có lịch trống</p>
        </div>

        <div
          className={`option ${bookingType === 'specific' ? 'active' : ''}`}
          onClick={() => setBookingType('specific')}
        >
          <h3>Đặt Lịch Khám Cùng Bác Sĩ</h3>
          <p>Chọn bác sĩ cụ thể và thời gian phù hợp</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-grid">
            <div>
              <label htmlFor="name">Tên bệnh nhân *</label>
              <input id="name" type="text" required />
            </div>
            <div>
              <label htmlFor="email">Email *</label>
              <input id="email" type="email" required />
            </div>
            <div>
              <label htmlFor="phone">Số điện thoại *</label>
              <input id="phone" type="text" required />
            </div>
            <div>
              <label htmlFor="birthdate">Ngày sinh *</label>
              <input id="birthdate" type="date" required />
            </div>
            <div>
              <label htmlFor="gender">Giới tính *</label>
              <select id="gender" required>
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label htmlFor="address">Địa chỉ</label>
              <input id="address" type="text" />
            </div>
          </div>

          <div>
            <label htmlFor="symptoms">Triệu chứng</label>
            <textarea id="symptoms" rows="3" placeholder="Mô tả triệu chứng hiện tại..."></textarea>
          </div>

          {bookingType === 'specific' && (
            <div className="extra-info">
              <h3>Chọn Bác Sĩ</h3>
              <div>
                <label>Bác sĩ yêu cầu *</label>
                <select required>
                  <option value="">Chọn bác sĩ</option>
                  {[
                    'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Châu',
                    'Phạm Hoàng Dũng', 'Nguyễn Thị Mai', 'Vũ Quốc Huy',
                    'Lý Thị Hoa', 'Đặng Văn Thành', 'Hoàng Thị Lan', 'Bùi Minh Tuấn'
                  ].map((name, i) => (
                    <option key={i} value={`doctor${i + 1}`}>BS. {name}</option>
                  ))}
                </select>
              </div>
              <div className="time-grid">
                <div>
                  <label>Ngày khám *</label>
                  <input type="date" required />
                </div>
                <div>
                  <label>Giờ khám *</label>
                  <select required>
                    <option value="">Chọn giờ</option>
                    {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {bookingType === 'general' && (
            <div className="extra-info">
              <h3>Chọn Thời Gian</h3>
              <div className="time-grid">
                <div>
                  <label>Ngày khám *</label>
                  <input type="date" required />
                </div>
                <div>
                  <label>Giờ khám *</label>
                  <select required>
                    <option value="">Chọn giờ</option>
                    <option value="morning">Buổi sáng (8:00-11:30)</option>
                    <option value="afternoon">Buổi chiều (14:00-17:00)</option>
                    <option value="evening">Buổi tối (18:00-20:00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="submit-wrapper">
            <button type="submit" className="submit-btn">
              Đặt Lịch Khám
            </button>
          </div>
        </form>
      </div>

      <div className="note-card">
        <h3>Lưu Ý Quan Trọng</h3>
        <ul>
          <li>• Sau khi đặt lịch, chúng tôi sẽ gửi email xác nhận trong vòng 15 phút</li>
          <li>• Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục</li>
          <li>• Mang theo CMND/CCCD và thẻ bảo hiểm y tế (nếu có)</li>
          <li>• Liên hệ hotline 0912345678 nếu cần thay đổi lịch hẹn</li>
        </ul>
      </div>
    </div>
  );
};

export default AppointmentBooking;
