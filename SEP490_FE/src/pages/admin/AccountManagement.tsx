
import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Search, Eye } from 'lucide-react';

const AccountManagement: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    {
      id: 1,
      name: 'Nguyễn Văn Nam',
      email: 'nam@phongkham.com',
      role: 'Patient',
      phone: '0912345678',
      status: 'Hoạt động',
      createdDate: '2025-01-15',
      lastLogin: '2025-06-18'
    },
    {
      id: 2,
      name: 'BS. Trần Thị Lan',
      email: 'bs.lan@phongkham.com',
      role: 'Doctor',
      phone: '0987654321',
      status: 'Hoạt động',
      createdDate: '2025-02-01',
      lastLogin: '2025-06-18',
      specialty: 'Thần kinh học',
      license: 'BS12345'
    },
    {
      id: 3,
      name: 'Lê Thị Hoa',
      email: 'hoa@phongkham.com',
      role: 'Receptionist',
      phone: '0901234567',
      status: 'Hoạt động',
      createdDate: '2025-03-10',
      lastLogin: '2025-06-17'
    },
    {
      id: 4,
      name: 'Phạm Văn Minh',
      email: 'minh@phongkham.com',
      role: 'Admin',
      phone: '0976543210',
      status: 'Hoạt động',
      createdDate: '2025-01-01',
      lastLogin: '2025-06-18'
    },
    {
      id: 5,
      name: 'BS. Hoàng Thị Bình',
      email: 'bs.binh@phongkham.com',
      role: 'Doctor',
      phone: '0945678912',
      status: 'Không hoạt động',
      createdDate: '2025-04-20',
      lastLogin: '2025-06-10',
      specialty: 'Tâm thần học',
      license: 'BS67890'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Doctor': return 'bg-blue-100 text-blue-800';
      case 'Receptionist': return 'bg-green-100 text-green-800';
      case 'Patient': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Hoạt động' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Quản lý tài khoản
          </h1>
          <p className="text-gray-600">
            Tạo và quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        
        <button className="flex items-center space-x-2 clinic-button-primary">
          <Plus size={20} />
          <span>Tạo tài khoản mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="clinic-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="Admin">Quản trị viên</option>
              <option value="Doctor">Bác sĩ</option>
              <option value="Receptionist">Lễ tân</option>
              <option value="Patient">Bệnh nhân</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue">
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="clinic-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Người dùng</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Vai trò</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Liên hệ</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Trạng thái</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Hoạt động cuối</th>
                <th className="text-center py-3 px-4 font-medium text-clinic-navy">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-clinic-navy rounded-full flex items-center justify-center">
                        <Users className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-clinic-navy">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.role === 'Doctor' && user.specialty && (
                          <p className="text-xs text-gray-500">{user.specialty}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                      {user.role === 'Admin' ? 'Quản trị viên' :
                       user.role === 'Doctor' ? 'Bác sĩ' :
                       user.role === 'Receptionist' ? 'Lễ tân' : 'Bệnh nhân'}
                    </span>
                    {user.role === 'Doctor' && user.license && (
                      <p className="text-xs text-gray-500 mt-1">SCC: {user.license}</p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-700">{user.phone}</p>
                    <p className="text-sm text-gray-500">Tạo: {user.createdDate}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {user.lastLogin}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center space-x-2">
                      <button className="p-2 text-clinic-navy hover:bg-clinic-blue rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">{users.length}</h3>
          <p className="text-gray-600">Tổng người dùng</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'Doctor').length}
          </h3>
          <p className="text-gray-600">Bác sĩ</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-green-600">
            {users.filter(u => u.role === 'Receptionist').length}
          </h3>
          <p className="text-gray-600">Lễ tân</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-gray-600">
            {users.filter(u => u.role === 'Patient').length}
          </h3>
          <p className="text-gray-600">Bệnh nhân</p>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
