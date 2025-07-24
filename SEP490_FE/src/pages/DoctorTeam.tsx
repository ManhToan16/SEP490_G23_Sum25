import { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, Star } from 'lucide-react';
import { doctorService } from '@/shared/services/doctorService';

const DoctorTeam = ({ onNavigateToAppointment }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await doctorService.getAll();
        setDoctors(data);
      } catch (error) {
        console.error("Failed to fetch doctors", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) return <div className="text-center py-10">Đang tải danh sách bác sĩ...</div>;

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
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Đội Ngũ Chuyên Gia</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Các bác sĩ giàu kinh nghiệm trong các lĩnh vực chuyên khoa, tận tâm chăm sóc sức khỏe của bạn
        </p>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src={`http://be.khanhanclinic.io.vn/${doctor.avatar}`}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">{doctor.name}</h3>

              <Badge className="bg-blue-100 text-blue-800 mb-3">
                {doctor.qualifications}
              </Badge>

              <div className="flex items-center justify-center gap-1 mb-3">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600">{doctor.yearsOfExperience} kinh nghiệm</span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {doctor.biography}
              </p>

              <div className="space-y-2">
                <Button onClick={() => setSelectedDoctor(doctor)} variant="outline" className="w-full">
                  Xem Chi Tiết
                </Button>
                <Button onClick={onNavigateToAppointment} className="w-full bg-blue-600 hover:bg-blue-700">
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
                {doctor.name?.split(' ').pop()?.[0] || '?'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{doctor.name}</h2>
            <Badge className="bg-blue-100 text-blue-800 mb-4">
              {doctor.qualifications}
            </Badge>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Email</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.email}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Số điện thoại</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.phoneNumber}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Số Năm Kinh Nghiệm</h3>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-lg">{doctor.yearsOfExperience}</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Mô Tả</h3>
              <p className="text-gray-600 leading-relaxed">
                {doctor.biography}
              </p>
            </div>

            <Button onClick={onNavigateToAppointment} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
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
