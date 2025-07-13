import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Phone, Mail, Clock, Calendar, Users, FileText, Star, MapPin, Shield, Award, Stethoscope, Brain, Activity, Eye, Heart, TestTube, Zap } from 'lucide-react';
import AppointmentBooking from '@/shared/components/ui/AppointmentBooking';
import DoctorTeam from '@/pages/DoctorTeam';
import MedicalServices from '@/pages/MedicalServices';
import ResultLookup from '@/pages/ResultLookup';
import LoginModal from '@/pages/LoginModal';
const HomePage = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-blue-800">
                Phòng Khám Nội Thần Kinh Khánh An
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500" />
                  <span className="font-semibold">Đường Dây Nóng: 0912345678</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>khanhanclinic@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>Số 4, ngõ 4/15, phường Phương Mai, Hà Nội</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowLogin(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              Đăng Nhập
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-700 text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-1">
            {[
              { key: 'home', label: 'Trang Chủ', icon: Clock },
              { key: 'team', label: 'Đội Ngũ Chuyên Gia', icon: Users },
              { key: 'services', label: 'Dịch Vụ Y Tế', icon: FileText },
              { key: 'appointment', label: 'Đặt Lịch Khám', icon: Calendar },
              { key: 'results', label: 'Tra Cứu Kết Quả', icon: Star }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-blue-600 ${
                  activeSection === key ? 'bg-blue-800 border-b-2 border-white' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderActiveSection()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Thông tin liên hệ */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-400">Liên Hệ</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-sm">Số 4, ngõ 4/15, phường Phương Mai, số nhà 111A12, Hà Nội</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">0912345678</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">khanhanclinic@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Thứ 2 - CN: 8:00 - 17:00</span>
                </div>
              </div>
            </div>

            {/* Dịch vụ chuyên khoa */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-400">Chuyên Khoa</h3>
              <ul className="space-y-2 text-sm">
                <li>• Nội Thần Kinh</li>
                <li>• Thần Kinh Cơ - Xương - Khớp</li>
                <li>• Chẩn Đoán Hình Ảnh</li>
                <li>• Xét Nghiệm Chuyên Sâu</li>
                <li>• Khám Sức Khỏe Tâm Lý</li>
                <li>• Nội Tổng Hợp</li>
              </ul>
            </div>

            {/* Dịch vụ cận lâm sàng */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-400">Dịch Vụ Cận Lâm Sàng</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  Điện Não (EEG)
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  Điện Tim (ECG)
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Điện Cơ (EMG)
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  Siêu Âm Doppler
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  Siêu Âm Tổng Quát
                </li>
                <li className="flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-orange-400" />
                  Xét Nghiệm & Test Tâm Lý
                </li>
              </ul>
            </div>

            {/* Về chúng tôi */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-400">Về Chúng Tôi</h3>
              <p className="text-sm text-gray-300 mb-4">
                Phòng khám chuyên sâu đa ngành với 7 phòng cận lâm sàng và 5 phòng khám chuyên khoa, 
                phục vụ toàn diện nhu cầu chăm sóc sức khỏe thần kinh.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Thiết bị hiện đại - Đội ngũ chuyên nghiệp</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-600 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 Phòng Khám Nội Thần Kinh Khánh An. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

const HomeSection = ({ setActiveSection }) => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Chăm Sóc Sức Khỏe Thần Kinh Chuyên Nghiệp
        </h2>
        <p className="text-xl mb-8 max-w-4xl mx-auto leading-relaxed">
          Với 7 phòng cận lâm sàng trang bị thiết bị hiện đại và 5 phòng khám chuyên khoa, 
          chúng tôi cung cấp dịch vụ chăm sóc sức khỏe toàn diện trong lĩnh vực thần kinh học
        </p>
        <Button 
          onClick={() => setActiveSection('appointment')}
          className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-full font-semibold"
        >
          Đặt Lịch Khám Ngay
        </Button>
      </section>

      {/* Cơ sở vật chất */}
      <section>
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Cơ Sở Vật Chất Hiện Đại
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-blue-500">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3">5 Phòng Khám Chuyên Khoa</h4>
            <p className="text-gray-600">
              Bố trí hợp lý để tối ưu hóa quy trình khám và điều trị bệnh nhân
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-green-500">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3">7 Phòng Cận Lâm Sàng</h4>
            <p className="text-gray-600">
              Trang bị đầy đủ thiết bị chuyên dụng cho các kỹ thuật chẩn đoán hiện đại
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-purple-500">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3">Khu Vực Tiếp Nhận</h4>
            <p className="text-gray-600">
              Tầng trệt thuận tiện cho đăng ký và xử lý thủ tục hành chính
            </p>
          </Card>
        </div>
      </section>

      {/* Dịch vụ cận lâm sàng */}
      <section className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Dịch Vụ Cận Lâm Sàng Chuyên Sâu
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: "Điện Não (EEG)", desc: "Ghi nhận hoạt động điện của não bộ với độ chính xác cao", color: "blue" },
            { icon: Heart, title: "Điện Tim (ECG)", desc: "Đánh giá hoạt động tim mạch toàn diện", color: "red" },
            { icon: Zap, title: "Điện Cơ (EMG)", desc: "Kiểm tra chức năng cơ và dây thần kinh chuyên sâu", color: "yellow" },
            { icon: Activity, title: "Siêu Âm Doppler", desc: "Đánh giá lưu lượng và tình trạng dòng máu", color: "green" },
            { icon: Eye, title: "Siêu Âm Tổng Quát", desc: "Kiểm tra các cơ quan nội tạng chi tiết", color: "purple" },
            { icon: TestTube, title: "Xét Nghiệm & Test Tâm Lý", desc: "Phân tích mẫu máu và đánh giá sức khỏe tâm lý", color: "orange" }
          ].map(({ icon: Icon, title, desc, color }, index) => (
            <Card key={index} className="p-4 hover:shadow-lg transition-all hover:scale-105">
              <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
              </div>
              <h4 className="font-semibold mb-2">{title}</h4>
              <p className="text-sm text-gray-600">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Chuyên khoa */}
      <section>
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Lĩnh Vực Chuyên Khoa
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <h4 className="text-xl font-semibold mb-4 text-blue-600">Chuyên Khoa Chính</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Nội Thần Kinh</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Thần Kinh Cơ - Xương - Khớp</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Chẩn Đoán Hình Ảnh</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <h4 className="text-xl font-semibold mb-4 text-green-600">Dịch Vụ Hỗ Trợ</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Xét Nghiệm Chuyên Sâu</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Khám Sức Khỏe Tâm Lý</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Nội Tổng Hợp</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Quy trình khám */}
      <section className="bg-blue-50 rounded-2xl p-8">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Quy Trình Khám Bệnh
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Đăng Ký", desc: "Đăng ký thông tin tại quầy lễ tân và thanh toán phí khám ban đầu" },
            { step: "02", title: "Khám Lâm Sàng", desc: "Gặp bác sĩ chuyên khoa để thăm khám và nhận chỉ định cận lâm sàng" },
            { step: "03", title: "Thực Hiện Xét Nghiệm", desc: "Thực hiện các xét nghiệm, chẩn đoán hình ảnh theo chỉ định" },
            { step: "04", title: "Kết Luận & Điều Trị", desc: "Nhận kết quả, chẩn đoán và phương án điều trị từ bác sĩ" }
          ].map(({ step, title, desc }, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {step}
              </div>
              <h4 className="font-semibold mb-2">{title}</h4>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Thành Tích Nổi Bật
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
            <div className="text-gray-600">Bệnh Nhân Đã Khám</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">12</div>
            <div className="text-gray-600">Phòng Chức Năng</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">10+</div>
            <div className="text-gray-600">Năm Kinh Nghiệm</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Hỗ Trợ Khẩn Cấp</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
