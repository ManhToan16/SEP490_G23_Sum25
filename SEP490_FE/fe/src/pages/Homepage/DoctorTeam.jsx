// DoctorTeam.jsx
import React, { useState } from 'react';
import './DoctorTeam.scss';
import { Calendar, Star } from 'lucide-react';

const doctors = [
  {
    id: 1,
    name: 'BS. Nguyễn Văn An',
    avatar: '/placeholder.svg',
    specialty: 'Nội Thần Kinh',
    experience: '15 năm',
    degrees: ['Tiến sĩ Y khoa', 'Chuyên khoa II Thần kinh'],
    description: 'Chuyên điều trị các bệnh lý thần kinh phức tạp, đặc biệt về đau đầu và rối loạn giấc ngủ. Có kinh nghiệm làm việc tại Bệnh viện Bạch Mai.'
  },
  {
    id: 2,
    name: 'BS. Trần Thị Bình',
    avatar: '/placeholder.svg',
    specialty: 'Thần Kinh Nhi',
    experience: '12 năm',
    degrees: ['Thạc sĩ Y khoa', 'Chuyên khoa I Thần kinh'],
    description: 'Chuyên gia hàng đầu về các rối loạn thần kinh ở trẻ em và thanh thiếu niên. Từng công tác tại Bệnh viện Nhi Trung ương.'
  },
  {
    id: 3,
    name: 'BS. Lê Minh Châu',
    avatar: '/placeholder.svg',
    specialty: 'Điện Não Đồ',
    experience: '10 năm',
    degrees: ['Bác sĩ Y khoa', 'Chứng chỉ Điện não đồ'],
    description: 'Chuyên thực hiện và đọc kết quả các xét nghiệm điện não đồ và điện cơ. Có chứng chỉ quốc tế về EEG.'
  },
  {
    id: 4,
    name: 'BS. Phạm Hoàng Dũng',
    avatar: '/placeholder.svg',
    specialty: 'Thần Kinh Cơ - Xương - Khớp',
    experience: '14 năm',
    degrees: ['Thạc sĩ Y khoa', 'Chuyên khoa II Thần kinh'],
    description: 'Chuyên sâu về các bệnh lý thần kinh cơ và xương khớp. Từng đào tạo tại Nhật Bản về kỹ thuật điện cơ đồ hiện đại.'
  },
  {
    id: 5,
    name: 'BS. Nguyễn Thị Mai',
    avatar: '/placeholder.svg',
    specialty: 'Tâm Lý Lâm Sàng',
    experience: '8 năm',
    degrees: ['Thạc sĩ Tâm lý học', 'Chứng chỉ Tâm lý lâm sàng'],
    description: 'Chuyên gia tâm lý lâm sàng, điều trị các rối loạn lo âu, trầm cảm và rối loạn hành vi. Có kinh nghiệm tại Viện Sức khỏe Tâm thần.'
  },
  {
    id: 6,
    name: 'BS. Vũ Quốc Huy',
    avatar: '/placeholder.svg',
    specialty: 'Chẩn Đoán Hình Ảnh',
    experience: '13 năm',
    degrees: ['Tiến sĩ Y khoa', 'Chuyên khoa II Chẩn đoán hình ảnh'],
    description: 'Chuyên đọc và phân tích các hình ảnh chẩn đoán thần kinh. Từng công tác tại Bệnh viện Việt Đức với nhiều năm kinh nghiệm.'
  },
  {
    id: 7,
    name: 'BS. Lý Thị Hoa',
    avatar: '/placeholder.svg',
    specialty: 'Siêu Âm Doppler',
    experience: '11 năm',
    degrees: ['Bác sĩ Y khoa', 'Chứng chỉ Siêu âm Doppler'],
    description: 'Chuyên thực hiện siêu âm Doppler mạch máu não và đánh giá tuần hoàn não. Có chứng chỉ quốc tế về siêu âm mạch máu.'
  },
  {
    id: 8,
    name: 'BS. Đặng Văn Thành',
    avatar: '/placeholder.svg',
    specialty: 'Nội Tổng Hợp',
    experience: '16 năm',
    degrees: ['Tiến sĩ Y khoa', 'Chuyên khoa II Nội tổng hợp'],
    description: 'Bác sĩ nội tổng hợp với kinh nghiệm phong phú trong điều trị các bệnh lý nội khoa kết hợp thần kinh. Từng làm việc tại BV 108.'
  },
  {
    id: 9,
    name: 'BS. Hoàng Thị Lan',
    avatar: '/placeholder.svg',
    specialty: 'Xét Nghiệm',
    experience: '9 năm',
    degrees: ['Thạc sĩ Y khoa', 'Chuyên khoa I Xét nghiệm'],
    description: 'Chuyên gia xét nghiệm với kinh nghiệm trong phân tích các chỉ số máu liên quan đến thần kinh và tâm lý.'
  },
  {
    id: 10,
    name: 'BS. Bùi Minh Tuấn',
    avatar: '/placeholder.svg',
    specialty: 'Thần Kinh Can Thiệp',
    experience: '12 năm',
    degrees: ['Tiến sĩ Y khoa', 'Fellowship Thần kinh can thiệp'],
    description: 'Chuyên gia thần kinh can thiệp, điều trị các bệnh lý mạch máu não phức tạp. Đào tạo tại Singapore về kỹ thuật can thiệp hiện đại.'
  }
];

const DoctorTeam = ({ onNavigateToAppointment }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  if (selectedDoctor) {
    return (
      <DoctorProfile 
        doctor={selectedDoctor} 
        onBack={() => setSelectedDoctor(null)} 
        onNavigateToAppointment={onNavigateToAppointment} 
      />
    );
  }

  return (
    <div className="doctor-team">
      <div className="doctor-team__header">
        <h2>Đội Ngũ Chuyên Gia</h2>
        <p>10 bác sĩ giàu kinh nghiệm trong các lĩnh vực chuyên khoa, tận tâm chăm sóc sức khỏe của bạn</p>
      </div>
      <div className="doctor-team__grid">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <div className="avatar-circle">
              <span>{doctor.name.split(' ').pop()[0]}</span>
            </div>
            <h3>{doctor.name}</h3>
            <div className="badge specialty">{doctor.specialty}</div>
            <div className="experience">
              <Star className="star-icon" />
              <span>{doctor.experience} kinh nghiệm</span>
            </div>
            <p className="description">{doctor.description}</p>
            <button className="btn-outline" onClick={() => setSelectedDoctor(doctor)}>
              Xem Chi Tiết
            </button>
            <button className="btn-primary" onClick={onNavigateToAppointment}>
              <Calendar className="icon" /> Đặt Lịch Khám
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const DoctorProfile = ({ doctor, onBack, onNavigateToAppointment }) => {
  return (
    <div className="doctor-profile">
      <button className="btn-outline" onClick={onBack}>← Quay Lại</button>
      <div className="profile-card">
        <div className="profile-left">
          <div className="avatar-circle large">
            <span>{doctor.name.split(' ').pop()[0]}</span>
          </div>
          <h2>{doctor.name}</h2>
          <div className="badge specialty">{doctor.specialty}</div>
        </div>
        <div className="profile-right">
          <div className="section">
            <h3>Trình Độ Chuyên Môn</h3>
            <div className="badge-group">
              {doctor.degrees.map((degree, index) => (
                <span key={index} className="badge outline">{degree}</span>
              ))}
            </div>
          </div>
          <div className="section">
            <h3>Kinh Nghiệm</h3>
            <div className="experience">
              <Star className="star-icon" />
              <span>{doctor.experience}</span>
            </div>
          </div>
          <div className="section">
            <h3>Mô Tả</h3>
            <p>{doctor.description}</p>
          </div>
          <button className="btn-primary large" onClick={onNavigateToAppointment}>
            <Calendar className="icon" /> Đặt Lịch Khám Cùng Bác Sĩ
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorTeam;