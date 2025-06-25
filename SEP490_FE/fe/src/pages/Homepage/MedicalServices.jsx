// MedicalServices.jsx
import React from 'react';
import './MedicalServices.scss';
import { Clock, Star, FileText } from 'lucide-react';

const services = [
  {
    id: 1,
    name: 'Khám Thần Kinh Tổng Quát',
    price: '300.000 VNĐ',
    duration: '30 phút',
    description: 'Khám tổng quát các bệnh lý thần kinh, tư vấn và điều trị với bác sĩ chuyên khoa',
    features: ['Khám lâm sàng toàn diện', 'Tư vấn chuyên sâu', 'Kê đơn thuốc', 'Hẹn tái khám nếu cần']
  },
  {
    id: 2,
    name: 'Điện Não Đồ (EEG)',
    price: '450.000 VNĐ',
    duration: '30 phút',
    description: 'Ghi lại hoạt động điện của não bộ thông qua các điện cực gắn trên da đầu theo chuẩn quốc tế 10-20',
    features: ['Gắn điện cực theo chuẩn 10-20', 'Ghi điện não 20-30 phút', 'Báo cáo kết quả chi tiết', 'Tư vấn kết luận']
  },
  {
    id: 3,
    name: 'Điện Tim (ECG)',
    price: '200.000 VNĐ',
    duration: '15 phút',
    description: 'Ghi nhận các sóng điện phản ánh hoạt động của tim thông qua điện cực gắn ngực và tứ chi',
    features: ['Gắn điện cực chuyên dụng', 'Ghi điện tim vài phút', 'In kết quả ngay', 'Báo cáo điện tâm đồ']
  },
  {
    id: 4,
    name: 'Điện Cơ Đồ (EMG)',
    price: '500.000 VNĐ',
    duration: '45 phút',
    description: 'Kiểm tra chức năng cơ và dây thần kinh bằng kim điện cực nhỏ đưa vào bên trong cơ',
    features: ['Đánh giá chức năng cơ', 'Kiểm tra dây thần kinh', 'Ghi hoạt động điện học', 'Phân tích kết quả chuyên sâu']
  },
  {
    id: 5,
    name: 'Siêu Âm Doppler Mạch Máu',
    price: '400.000 VNĐ',
    duration: '30 phút',
    description: 'Đánh giá lưu lượng và tình trạng dòng máu trong các mạch máu cổ, tay, chân hoặc sọ não',
    features: ['Siêu âm mạch máu não', 'Đánh giá lưu lượng máu', 'Phát hiện tắc nghẽn', 'Báo cáo hình ảnh']
  },
  {
    id: 6,
    name: 'Siêu Âm Tổng Quát',
    price: '350.000 VNĐ',
    duration: '25 phút',
    description: 'Kiểm tra các cơ quan nội tạng như gan, thận, tụy, lách, bàng quang bằng đầu dò siêu âm',
    features: ['Siêu âm các cơ quan nội tạng', 'Không xâm lấn, không đau', 'Hình ảnh rõ nét', 'Báo cáo chi tiết']
  },
  {
    id: 7,
    name: 'Test Tâm Lý Lâm Sàng',
    price: '300.000 VNĐ',
    duration: '60 phút',
    description: 'Thực hiện các bài kiểm tra tâm lý cho bệnh nhân có rối loạn lo âu, trầm cảm, mất ngủ, rối loạn hành vi',
    features: ['Trắc nghiệm tâm lý tiêu chuẩn', 'Phỏng vấn lâm sàng', 'Phân tích kết quả', 'Tư vấn điều trị']
  },
  {
    id: 8,
    name: 'Xét Nghiệm Máu Chuyên Sâu',
    price: '250.000 VNĐ',
    duration: '10 phút',
    description: 'Lấy mẫu máu, nước tiểu và các mẫu khác theo quy trình kỹ thuật vô trùng, xử lý tại phòng lab',
    features: ['Lấy mẫu vô trùng', 'Mã hóa định danh mẫu', 'Xét nghiệm chuyên sâu', 'Kết quả nhanh chóng']
  },
  {
    id: 9,
    name: 'Khám Thần Kinh Cơ - Xương - Khớp',
    price: '350.000 VNĐ',
    duration: '40 phút',
    description: 'Chuyên khoa về các bệnh lý liên quan đến hệ thần kinh cơ và các vấn đề xương khớp',
    features: ['Khám chuyên khoa sâu', 'Đánh giá vận động', 'Tư vấn vật lý trị liệu', 'Kế hoạch điều trị']
  },
  {
    id: 10,
    name: 'Chẩn Đoán Hình Ảnh Thần Kinh',
    price: '400.000 VNĐ',
    duration: '35 phút',
    description: 'Sử dụng các phương pháp hình ảnh để chẩn đoán các bệnh lý thần kinh phức tạp',
    features: ['Đọc phim chuyên sâu', 'Phân tích hình ảnh', 'Kết luận chẩn đoán', 'Tư vấn điều trị']
  }
];

const MedicalServices = () => {
  return (
    <div className="medical-services">
      <div className="medical-services__header">
        <h2>Dịch Vụ Y Tế</h2>
        <p>
          Cung cấp đầy đủ các dịch vụ khám, điều trị và xét nghiệm chuyên khoa thần kinh với 7 phòng cận lâm sàng hiện đại
        </p>
      </div>

      <div className="medical-services__grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-card__top">
              <div>
                <h3>{service.name}</h3>
                <div className="service-card__duration">
                  <Clock className="icon" />
                  <span>{service.duration}</span>
                </div>
              </div>
              <div className="badge price">{service.price}</div>
            </div>

            <p className="description">{service.description}</p>

            <div>
              <h4 className="features-title">
                <FileText className="icon" /> Bao Gồm:
              </h4>
              <ul className="features-list">
                {service.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <Star className="star" /> {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="promo-card">
        <h3>Gói Khám Sức Khỏe Tổng Quát</h3>
        <p>Tiết kiệm chi phí khi đăng ký gói khám tổng hợp nhiều dịch vụ cận lâm sàng</p>
        <div className="promo-discounts">
          <div className="discount">
            <div className="percent">15%</div>
            <div>Giảm giá gói cơ bản</div>
          </div>
          <div className="discount">
            <div className="percent">25%</div>
            <div>Giảm giá gói nâng cao</div>
          </div>
          <div className="discount">
            <div className="percent">30%</div>
            <div>Giảm giá gói VIP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalServices;
