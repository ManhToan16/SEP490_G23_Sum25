
import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const patients = [
    {
      id: 1,
      name: 'Nguyễn Văn Nam',
      phone: '0912345678',
      email: 'nam@email.com',
      dateOfBirth: '1990-01-15',
      lastVisit: '2025-06-15',
      status: 'Hoạt động',
      insuranceNumber: 'BH123456789'
    },
    {
      id: 2,
      name: 'Trần Thị Lan',
      phone: '0987654321',
      email: 'lan@email.com',
      dateOfBirth: '1985-03-22',
      lastVisit: '2025-06-10',
      status: 'Hoạt động',
      insuranceNumber: 'BH987654321'
    },
    {
      id: 3,
      name: 'Lê Văn Minh',
      phone: '0901234567',
      email: 'minh@email.com',
      dateOfBirth: '1992-07-30',
      lastVisit: '2025-05-28',
      status: 'Không hoạt động',
      insuranceNumber: 'BH456789123'
    },
    {
      id: 4,
      name: 'Phạm Thị Hương',
      phone: '0976543210',
      email: 'huong@email.com',
      dateOfBirth: '1988-11-12',
      lastVisit: '2025-06-12',
      status: 'Hoạt động',
      insuranceNumber: 'BH789123456'
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Danh sách bệnh nhân
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin bệnh nhân trong hệ thống
          </p>
        </div>
        
        <button
          onClick={() => navigate('/receptionist/create-patient')}
          className="flex items-center space-x-2 clinic-button-primary"
        >
          <Plus size={20} />
          <span>Thêm bệnh nhân mới</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="clinic-card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            />
          </div>
          
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Patient List */}
      <div className="clinic-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Họ tên</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Liên hệ</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Ngày sinh</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Lần khám cuối</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Trạng thái</th>
                <th className="text-center py-3 px-4 font-medium text-clinic-navy">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <h4 className="font-medium text-clinic-navy">{patient.name}</h4>
                      <p className="text-sm text-gray-600">BH: {patient.insuranceNumber}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone size={14} />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail size={14} />
                        <span>{patient.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {patient.dateOfBirth}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {patient.lastVisit}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      patient.status === 'Hoạt động' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center space-x-2">
                      <button className="p-2 text-clinic-navy hover:bg-clinic-blue rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-clinic-navy hover:bg-clinic-blue rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-clinic-navy hover:bg-clinic-blue rounded-lg transition-colors">
                        <Phone size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy bệnh nhân nào</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">{patients.length}</h3>
          <p className="text-gray-600">Tổng bệnh nhân</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">
            {patients.filter(p => p.status === 'Hoạt động').length}
          </h3>
          <p className="text-gray-600">Đang hoạt động</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">
            {patients.filter(p => p.lastVisit === '2025-06-15').length}
          </h3>
          <p className="text-gray-600">Khám hôm nay</p>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
