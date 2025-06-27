
import React, { useState } from 'react';
import { Building, Plus, Edit, Trash2, MapPin } from 'lucide-react';

const ClinicManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('departments');

  const departments = [
    { id: 1, name: 'Khoa Thần kinh', description: 'Chẩn đoán và điều trị các bệnh về thần kinh', head: 'BS. Nguyễn Văn A', staff: 3 },
    { id: 2, name: 'Khoa Tâm thần', description: 'Điều trị các rối loạn tâm thần và tâm lý', head: 'BS. Trần Thị B', staff: 2 },
    { id: 3, name: 'Khoa Tâm lý', description: 'Tư vấn và điều trị tâm lý', head: 'ThS. Lê Văn C', staff: 2 }
  ];

  const services = [
    { id: 1, name: 'Khám tổng quát thần kinh', department: 'Khoa Thần kinh', fee: '500.000đ', duration: '30 phút' },
    { id: 2, name: 'Khám chuyên sâu não bộ', department: 'Khoa Thần kinh', fee: '800.000đ', duration: '60 phút' },
    { id: 3, name: 'Tư vấn tâm lý cá nhân', department: 'Khoa Tâm lý', fee: '400.000đ', duration: '45 phút' },
    { id: 4, name: 'Điện não đồ (EEG)', department: 'Khoa Thần kinh', fee: '1.200.000đ', duration: '90 phút' },
    { id: 5, name: 'Đánh giá tâm lý học', department: 'Khoa Tâm lý', fee: '600.000đ', duration: '60 phút' }
  ];

  const rooms = [
    { id: 1, name: 'Phòng khám chính 1', type: 'Phòng khám', floor: 1, equipment: 'Giường khám, bàn làm việc, tủ thuốc', status: 'Hoạt động' },
    { id: 2, name: 'Phòng khám chính 2', type: 'Phòng khám', floor: 1, equipment: 'Giường khám, bàn làm việc, tủ thuốc', status: 'Hoạt động' },
    { id: 3, name: 'Phòng tư vấn 1', type: 'Phòng tư vấn', floor: 2, equipment: 'Bàn tư vấn, ghế ngồi, tivi', status: 'Hoạt động' },
    { id: 4, name: 'Phòng xét nghiệm', type: 'Phòng xét nghiệm', floor: 1, equipment: 'Máy EEG, thiết bị đo điện não', status: 'Bảo trì' },
    { id: 5, name: 'Phòng chờ VIP', type: 'Phòng chờ', floor: 2, equipment: 'Ghế sofa, tivi, máy lạnh', status: 'Hoạt động' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoạt động': return 'bg-green-100 text-green-800';
      case 'Bảo trì': return 'bg-yellow-100 text-yellow-800';
      case 'Không hoạt động': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Quản lý phòng khám
        </h1>
        <p className="text-gray-600">
          Quản lý khoa phòng, dịch vụ và cơ sở vật chất
        </p>
      </div>

      {/* Tabs */}
      <div className="clinic-card">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'departments'
                ? 'bg-white text-clinic-navy shadow-sm'
                : 'text-gray-600 hover:text-clinic-navy'
            }`}
          >
            Khoa phòng
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-white text-clinic-navy shadow-sm'
                : 'text-gray-600 hover:text-clinic-navy'
            }`}
          >
            Dịch vụ
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'rooms'
                ? 'bg-white text-clinic-navy shadow-sm'
                : 'text-gray-600 hover:text-clinic-navy'
            }`}
          >
            Phòng ban
          </button>
        </div>
      </div>

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy">
              Quản lý khoa phòng
            </h2>
            <button className="flex items-center space-x-2 clinic-button-primary">
              <Plus size={20} />
              <span>Thêm khoa mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div key={dept.id} className="clinic-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-clinic-blue rounded-lg flex items-center justify-center">
                    <Building className="text-white" size={24} />
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-clinic-navy hover:bg-gray-100 rounded-lg">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-poppins font-semibold text-clinic-navy mb-2">
                  {dept.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{dept.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trưởng khoa:</span>
                    <span className="text-clinic-navy font-medium">{dept.head}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nhân viên:</span>
                    <span className="text-clinic-navy font-medium">{dept.staff} người</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy">
              Quản lý dịch vụ
            </h2>
            <button className="flex items-center space-x-2 clinic-button-primary">
              <Plus size={20} />
              <span>Thêm dịch vụ mới</span>
            </button>
          </div>

          <div className="clinic-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-clinic-navy">Tên dịch vụ</th>
                    <th className="text-left py-3 px-4 font-medium text-clinic-navy">Khoa phụ trách</th>
                    <th className="text-left py-3 px-4 font-medium text-clinic-navy">Chi phí</th>
                    <th className="text-left py-3 px-4 font-medium text-clinic-navy">Thời gian</th>
                    <th className="text-center py-3 px-4 font-medium text-clinic-navy">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <h4 className="font-medium text-clinic-navy">{service.name}</h4>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {service.department}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-clinic-navy">{service.fee}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {service.duration}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center space-x-2">
                          <button className="p-2 text-clinic-navy hover:bg-clinic-blue rounded-lg transition-colors">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy">
              Quản lý phòng ban
            </h2>
            <button className="flex items-center space-x-2 clinic-button-primary">
              <Plus size={20} />
              <span>Thêm phòng mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="clinic-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-poppins font-semibold text-clinic-navy mb-1">
                      {room.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span>Tầng {room.floor}</span>
                      <span>•</span>
                      <span>{room.type}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-clinic-navy hover:bg-gray-100 rounded-lg">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Trang thiết bị:</h4>
                  <p className="text-sm text-gray-600">{room.equipment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">{departments.length}</h3>
          <p className="text-gray-600">Khoa phòng</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">{services.length}</h3>
          <p className="text-gray-600">Dịch vụ</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">{rooms.length}</h3>
          <p className="text-gray-600">Phòng ban</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-green-600">
            {rooms.filter(r => r.status === 'Hoạt động').length}
          </h3>
          <p className="text-gray-600">Đang hoạt động</p>
        </div>
      </div>
    </div>
  );
};

export default ClinicManagement;
