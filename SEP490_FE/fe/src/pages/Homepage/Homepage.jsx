// File: Homepage.jsx
import React, { useState } from 'react';
import './Homepage.scss';
import AppointmentBooking from './AppointmentBooking';
import DoctorTeam from './DoctorTeam';
import MedicalServices from './MedicalServices';
import ResultLookup from './ResultLookup';
import LoginModal from './LoginModal';


const Homepage = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [showLogin, setShowLogin] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'team':
        return <DoctorTeam onNavigateToAppointment={() => setActiveSection('appointment')} />;
      case 'services':
        return <MedicalServices />;
      case 'appointment':
        return <AppointmentBooking />;
      case 'results':
        return <ResultLookup />;
      default:
        return <HomeSection setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="homepage-container">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-top">
            <div className="clinic-info">
              <h1>Phòng Khám Nội Thần Kinh Khánh An</h1>
              <div className="clinic-contacts">
                <span>Đường Dây Nóng: 0912345678</span>
                <span>Email: khanhanclinic@gmail.com</span>
                <span>Địa chỉ: Số 4, ngõ 4/15, phường Phương Mai, Hà Nội</span>
              </div>
            </div>
            <button className="login-button" onClick={() => setShowLogin(true)}>Đăng Nhập</button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="navigation">
        <div className="container">
          <ul className="nav-list">
            <li className={activeSection === 'home' ? 'active' : ''} onClick={() => setActiveSection('home')}>Trang Chủ</li>
            <li className={activeSection === 'team' ? 'active' : ''} onClick={() => setActiveSection('team')}>Đội Ngũ Chuyên Gia</li>
            <li className={activeSection === 'services' ? 'active' : ''} onClick={() => setActiveSection('services')}>Dịch Vụ Y Tế</li>
            <li className={activeSection === 'appointment' ? 'active' : ''} onClick={() => setActiveSection('appointment')}>Đặt Lịch Khám</li>
            <li className={activeSection === 'results' ? 'active' : ''} onClick={() => setActiveSection('results')}>Tra Cứu Kết Quả</li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content container">
        {renderActiveSection()}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          {/* Thông tin liên hệ */}
          <div className="footer-section">
            <h3>Liên Hệ</h3>
            <p>Địa chỉ: Số 4, ngõ 4/15, số nhà 111A12, Hà Nội</p>
            <p>Điện thoại: 0912345678</p>
            <p>Email: khanhanclinic@gmail.com</p>
            <p>Giờ làm việc: Thứ 2 - CN: 8:00 - 17:00</p>
          </div>

          {/* Dịch vụ chuyên khoa */}
          <div className="footer-section">
            <h3>Chuyên Khoa</h3>
            <ul>
              <li>Nội Thần Kinh</li>
              <li>Thần Kinh Cơ - Xương - Khớp</li>
              <li>Chẩn Đoán Hình Ảnh</li>
              <li>Xét Nghiệm Chuyên Sâu</li>
              <li>Khám Sức Khỏe Tâm Lý</li>
              <li>Nội Tổng Hợp</li>
            </ul>
          </div>

          {/* Dịch vụ cận lâm sàng */}
          <div className="footer-section">
            <h3>Dịch Vụ Cận Lâm Sàng</h3>
            <ul>
              <li>Điện Não (EEG)</li>
              <li>Điện Tim (ECG)</li>
              <li>Điện Cơ (EMG)</li>
              <li>Siêu Âm Doppler</li>
              <li>Siêu Âm Tổng Quát</li>
              <li>Xét Nghiệm & Test Tâm Lý</li>
            </ul>
          </div>

          {/* Về chúng tôi */}
          <div className="footer-section">
            <h3>Về Chúng Tôi</h3>
            <p>Phòng khám chuyên sâu đa ngành với 7 phòng cận lâm sàng và 5 phòng khám chuyên khoa.</p>
            <p>Thiết bị hiện đại - Đội ngũ chuyên nghiệp</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Phòng Khám Nội Thần Kinh Khánh An. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

const HomeSection = ({ setActiveSection }) => {
  return (
    <div className="home-section">
      {/* Hero Section */}
      <section className="hero-section">
        <h2>Chăm Sóc Sức Khỏe Thần Kinh Chuyên Nghiệp</h2>
        <p>Với 7 phòng cận lâm sàng và 5 phòng khám chuyên khoa</p>
        <button onClick={() => setActiveSection('appointment')}>Đặt Lịch Khám Ngay</button>
      </section>

      {/* Cơ sở vật chất */}
      <section className="facility-section">
        <h3>Cơ Sở Vật Chất Hiện Đại</h3>
        <ul>
          <li>5 Phòng Khám Chuyên Khoa - Quy trình khám hợp lý</li>
          <li>7 Phòng Cận Lâm Sàng - Thiết bị chuyên dụng</li>
          <li>Khu Vực Tiếp Nhận - Đăng ký thuận tiện</li>
        </ul>
      </section>

      {/* Dịch vụ cận lâm sàng */}
      <section className="subclinical-section">
        <h3>Dịch Vụ Cận Lâm Sàng Chuyên Sâu</h3>
        <ul>
          <li>Điện Não (EEG)</li>
          <li>Điện Tim (ECG)</li>
          <li>Điện Cơ (EMG)</li>
          <li>Siêu Âm Doppler</li>
          <li>Siêu Âm Tổng Quát</li>
          <li>Xét Nghiệm & Test Tâm Lý</li>
        </ul>
      </section>

      {/* Chuyên khoa */}
      <section className="specialties-section">
        <h3>Lĩnh Vực Chuyên Khoa</h3>
        <div className="columns">
          <div>
            <h4>Chuyên Khoa Chính</h4>
            <ul>
              <li>Nội Thần Kinh</li>
              <li>Thần Kinh Cơ - Xương - Khớp</li>
              <li>Chẩn Đoán Hình Ảnh</li>
            </ul>
          </div>
          <div>
            <h4>Dịch Vụ Hỗ Trợ</h4>
            <ul>
              <li>Xét Nghiệm Chuyên Sâu</li>
              <li>Khám Sức Khỏe Tâm Lý</li>
              <li>Nội Tổng Hợp</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quy trình khám */}
      <section className="process-section">
        <h3>Quy Trình Khám Bệnh</h3>
        <ol>
          <li>01 - Đăng Ký: Nhập thông tin & thanh toán</li>
          <li>02 - Khám Lâm Sàng: Gặp bác sĩ</li>
          <li>03 - Xét Nghiệm: Thực hiện các chỉ định</li>
          <li>04 - Kết Luận & Điều Trị</li>
        </ol>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <h3>Thành Tích Nổi Bật</h3>
        <ul>
          <li>1000+ Bệnh Nhân Đã Khám</li>
          <li>12 Phòng Chức Năng</li>
          <li>10+ Năm Kinh Nghiệm</li>
          <li>24/7 Hỗ Trợ Khẩn Cấp</li>
        </ul>
      </section>
    </div>
  );
};

export default Homepage;
