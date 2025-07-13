import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, Star } from 'lucide-react';
import { useState } from 'react';

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
    return <DoctorProfile doctor={selectedDoctor} onBack={() => setSelectedDoctor(null)} onNavigateToAppointment={onNavigateToAppointment} />;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Đội Ngũ Chuyên Gia</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          10 bác sĩ giàu kinh nghiệm trong các lĩnh vực chuyên khoa, tận tâm chăm sóc sức khỏe của bạn
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {doctor.name.split(' ').pop()[0]}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{doctor.name}</h3>
              
              <Badge className="bg-blue-100 text-blue-800 mb-3">
                {doctor.specialty}
              </Badge>
              
              <div className="flex items-center justify-center gap-1 mb-3">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600">{doctor.experience} kinh nghiệm</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {doctor.description}
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => setSelectedDoctor(doctor)}
                  variant="outline" 
                  className="w-full"
                >
                  Xem Chi Tiết
                </Button>
                <Button 
                  onClick={onNavigateToAppointment}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Đặt Lịch Khám
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const DoctorProfile = ({ doctor, onBack, onNavigateToAppointment }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <Button onClick={onBack} variant="outline" className="mb-6">
        ← Quay Lại
      </Button>
      
      <Card className="p-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {doctor.name.split(' ').pop()[0]}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{doctor.name}</h2>
            <Badge className="bg-blue-100 text-blue-800 mb-4">
              {doctor.specialty}
            </Badge>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Trình Độ Chuyên Môn</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.degrees.map((degree, index) => (
                  <Badge key={index} variant="outline">
                    {degree}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Số Năm Kinh Nghiệm</h3>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-lg">{doctor.experience}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Mô Tả</h3>
              <p className="text-gray-600 leading-relaxed">
                {doctor.description}
              </p>
            </div>
            
            <Button 
              onClick={onNavigateToAppointment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Đặt Lịch Khám Cùng Bác Sĩ
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DoctorTeam;
